require("dotenv").config();
const http = require("http");
const connectRabbitMQ = require("./rabbitmq");
const redis = require("./redis");
const CircuitBreaker = require("./circuitBreaker");
const { updateJobStatus } = require("./jobStatus");

const {
  client,
  jobsProcessedTotal,
  jobsFailedTotal,
  jobProcessingDuration,
  circuitBreakerState,
} = require("./metrics");

/**
 * Update Prometheus circuit breaker gauge
 */
async function updateCircuitBreakerMetrics(breaker) {
  const state = await breaker.getState();
  circuitBreakerState.reset();
  circuitBreakerState.set({ state }, 1);
}

/**
 * Email Circuit Breaker
 */
const emailCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  cooldownPeriod: 15000,
});

/**
 * Metrics server
 */
http
  .createServer(async (req, res) => {
    if (req.url === "/metrics") {
      res.setHeader("Content-Type", client.register.contentType);
      res.end(await client.register.metrics());
    }
  })
  .listen(4000, "0.0.0.0", () => {
    console.log("📊 Worker metrics running on port 4000");
  });

async function startWorker() {
  const channel = await connectRabbitMQ();

  channel.consume(process.env.QUEUE_EMAIL, async (msg) => {
    if (!msg) return;

    const incomingJob = JSON.parse(msg.content.toString());
    const jobKey = `job:${incomingJob.id}`;

    console.log("🔧 Processing job:", incomingJob.id);
    const endTimer = jobProcessingDuration.startTimer();

    /**
     * 🚦 CIRCUIT GATE
     */
    const canProceed = await emailCircuitBreaker.canRequest();

    if (!canProceed && !incomingJob.forceRetry) {
      await updateCircuitBreakerMetrics(emailCircuitBreaker);

      const storedJob = await redis.get(jobKey);
      if (!storedJob) {
        channel.ack(msg);
        endTimer();
        return;
      }

      let currentJob = JSON.parse(storedJob);
      currentJob.retryCount += 1;

      if (currentJob.retryCount > currentJob.maxRetries) {
        await updateJobStatus(redis, currentJob, "DEAD_LETTER");

        channel.sendToQueue(
          `${process.env.QUEUE_EMAIL}_dlq`,
          Buffer.from(JSON.stringify(currentJob)),
          { persistent: true }
        );

        console.log("☠️ Job moved to DLQ (circuit open):", incomingJob.id);
        channel.ack(msg);
        endTimer();
        return;
      }

      await updateJobStatus(redis, currentJob, "FAILED");

      console.log(
        "⏸️ Circuit OPEN — delaying retry:",
        incomingJob.id,
        `(retry ${currentJob.retryCount})`
      );

      await new Promise((res) => setTimeout(res, 5000));
      channel.nack(msg, false, true);
      endTimer();
      return;
    }

    /**
     * 🌐 REAL ATTEMPT
     */
    try {
      const storedJob = await redis.get(jobKey);
      if (!storedJob) {
        channel.ack(msg);
        endTimer();
        return;
      }

      let currentJob = JSON.parse(storedJob);

      /**
       * 🔥 One-shot manual retry
       */
      if (currentJob.forceRetry) {
        delete currentJob.forceRetry;
        await redis.set(jobKey, JSON.stringify(currentJob));
      }

      await updateJobStatus(redis, currentJob, "PROCESSING");

      // Simulated email service
      if (Math.random() < 0.9) {
        throw new Error("Simulated email service failure");
      }

      await new Promise((res) => setTimeout(res, 2000));

      /**
       * ✅ SUCCESS
       */
      await emailCircuitBreaker.recordSuccess();
      await updateCircuitBreakerMetrics(emailCircuitBreaker);

      await updateJobStatus(redis, currentJob, "COMPLETED");

      jobsProcessedTotal.inc();
      channel.ack(msg);
      endTimer();

      console.log("✅ Job completed:", incomingJob.id);
    } catch (err) {
      console.error("❌ Job failed:", incomingJob.id, err.message);

      jobsFailedTotal.inc();
      endTimer();

      /**
       * Record failure for real attempt
       */
      await emailCircuitBreaker.recordFailure();
      await updateCircuitBreakerMetrics(emailCircuitBreaker);

      const storedJob = await redis.get(jobKey);
      if (!storedJob) {
        channel.ack(msg);
        return;
      }

      let currentJob = JSON.parse(storedJob);
      currentJob.retryCount += 1;

      if (currentJob.retryCount <= currentJob.maxRetries) {
        await updateJobStatus(redis, currentJob, "FAILED");

        console.log(
          "🔁 Retrying job:",
          incomingJob.id,
          `(retry ${currentJob.retryCount})`
        );

        await new Promise((res) => setTimeout(res, 3000));
        channel.nack(msg, false, true);
      } else {
        await updateJobStatus(redis, currentJob, "DEAD_LETTER");

        channel.sendToQueue(
          `${process.env.QUEUE_EMAIL}_dlq`,
          Buffer.from(JSON.stringify(currentJob)),
          { persistent: true }
        );

        console.log("☠️ Job moved to DLQ:", incomingJob.id);
        channel.ack(msg);
      }
    }
  });
}

startWorker();
