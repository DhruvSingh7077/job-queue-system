// require("dotenv").config();
// const http = require("http");
// const connectRabbitMQ = require("./rabbitmq");
// const redis = require("./redis");
// const CircuitBreaker = require("./circuitBreaker");
// const { updateJobStatus } = require("./jobStatus");

// const {
//   client,
//   jobsProcessedTotal,
//   jobsFailedTotal,
//   jobProcessingDuration,
//   circuitBreakerState,
// } = require("./metrics");

// /**
//  * Update circuit breaker metric
//  */
// function updateCircuitBreakerMetrics(breaker) {
//   circuitBreakerState.reset();
//   circuitBreakerState.set(
//     { state: breaker.getState() },
//     1
//   );
// }

// /**
//  * 🔁 Circuit Breaker (protects external service)
//  */
// const emailCircuitBreaker = new CircuitBreaker({
//   failureThreshold: 3,
//   cooldownPeriod: 15000,
// });

// /**
//  * 📊 Expose /metrics for Prometheus
//  */
// http
//   .createServer(async (req, res) => {
//     if (req.url === "/metrics") {
//       res.setHeader("Content-Type", client.register.contentType);
//       res.end(await client.register.metrics());
//     }
//   })
//   .listen(4000, "0.0.0.0", () => {
//     console.log("📊 Worker metrics running on port 4000");
//   });

// async function startWorker() {
//   const channel = await connectRabbitMQ();

//   channel.consume(process.env.QUEUE_EMAIL, async (msg) => {
//     const incomingJob = JSON.parse(msg.content.toString());
//     const jobKey = `job:${incomingJob.id}`;

//     console.log("🔧 Processing job:", incomingJob.id);

//     const endTimer = jobProcessingDuration.startTimer();

//     try {
//       /**
//        * 🚦 Circuit breaker check
//        */
//       if (!emailCircuitBreaker.canRequest()) {
//         updateCircuitBreakerMetrics(emailCircuitBreaker);
//         throw new Error("Circuit open: email service unavailable");
//       }

//       /**
//        * 🔍 Fetch job from Redis
//        */
//       const storedJob = await redis.get(jobKey);
//       if (!storedJob) {
//         throw new Error("Job not found in Redis");
//       }

//       let currentJob = JSON.parse(storedJob);

//       /**
//        * 🔄 Update status → PROCESSING
//        */
//       currentJob = await updateJobStatus(
//         redis,
//         currentJob,
//         "PROCESSING"
//       );

//       /**
//        * 🌐 Simulate external email service
//        */
//       if (Math.random() < 0.4) {
//         emailCircuitBreaker.recordFailure();
//         updateCircuitBreakerMetrics(emailCircuitBreaker);
//         throw new Error("Simulated email service failure");
//       }

//       // simulate work
//       await new Promise((res) => setTimeout(res, 2000));

//       /**
//        * ✅ Success path
//        */
//       emailCircuitBreaker.recordSuccess();
//       updateCircuitBreakerMetrics(emailCircuitBreaker);

//       await updateJobStatus(redis, currentJob, "COMPLETED");

//       jobsProcessedTotal.inc();
//       endTimer();

//       console.log("✅ Job completed:", incomingJob.id);
//       channel.ack(msg);
//     } catch (err) {
//       console.error("❌ Job failed:", incomingJob.id, err.message);

//       jobsFailedTotal.inc();
//       endTimer();

//       const storedJob = await redis.get(jobKey);
//       if (!storedJob) {
//         channel.nack(msg, false, false);
//         return;
//       }

//       let currentJob = JSON.parse(storedJob);
//       const retryCount = currentJob.retryCount + 1;

//       if (retryCount <= currentJob.maxRetries) {
//         currentJob = {
//           ...currentJob,
//           retryCount
//         };

//         await updateJobStatus(redis, currentJob, "FAILED");

//         console.log(
//           `🔁 Retrying job ${incomingJob.id} (${retryCount}/${currentJob.maxRetries})`
//         );

//         channel.nack(msg, false, true);
//       } else {
//         currentJob = {
//           ...currentJob,
//           retryCount
//         };

//         await updateJobStatus(redis, currentJob, "DEAD_LETTER");

//         channel.sendToQueue(
//           `${process.env.QUEUE_EMAIL}_dlq`,
//           Buffer.from(JSON.stringify(currentJob)),
//           { persistent: true }
//         );

//         console.log("☠️ Job moved to DLQ:", incomingJob.id);
//         channel.ack(msg);
//       }
//     }
//   });
// }

// startWorker();
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
 * Update circuit breaker metric
 */
function updateCircuitBreakerMetrics(breaker) {
  circuitBreakerState.reset();
  circuitBreakerState.set(
    { state: breaker.getState() },
    1
  );
}

/**
 * Circuit Breaker
 */
const emailCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  cooldownPeriod: 15000, // 15s
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
    const incomingJob = JSON.parse(msg.content.toString());
    const jobKey = `job:${incomingJob.id}`;

    console.log("🔧 Processing job:", incomingJob.id);

    const endTimer = jobProcessingDuration.startTimer();

    try {
      /**
       * 🚦 Circuit gate (NO failure recording here)
       */
      if (!emailCircuitBreaker.canRequest()) {
        updateCircuitBreakerMetrics(emailCircuitBreaker);
        throw new Error("Circuit open: email service unavailable");
      }

      /**
       * 🔍 Load job
       */
      const storedJob = await redis.get(jobKey);
      if (!storedJob) {
        throw new Error("Job not found in Redis");
      }

      let currentJob = JSON.parse(storedJob);

      /**
       * 🔄 PROCESSING
       */
      currentJob = await updateJobStatus(
        redis,
        currentJob,
        "PROCESSING"
      );

      /**
       * 🌐 REAL external attempt
       */
      const shouldFail = Math.random() < 0.4;

      if (shouldFail) {
        throw new Error("Simulated email service failure");
      }

      // simulate success work
      await new Promise((res) => setTimeout(res, 2000));

      /**
       * ✅ SUCCESS → CLOSE CIRCUIT
       */
      emailCircuitBreaker.recordSuccess();
      updateCircuitBreakerMetrics(emailCircuitBreaker);

      await updateJobStatus(redis, currentJob, "COMPLETED");

      jobsProcessedTotal.inc();
      endTimer();

      console.log("✅ Job completed:", incomingJob.id);
      channel.ack(msg);

    } catch (err) {
      console.error("❌ Job failed:", incomingJob.id, err.message);

      jobsFailedTotal.inc();
      endTimer();

      /**
       * ❌ Record failure ONLY for real attempt failures
       */
      if (!err.message.startsWith("Circuit open")) {
        emailCircuitBreaker.recordFailure();
        updateCircuitBreakerMetrics(emailCircuitBreaker);
      }

      const storedJob = await redis.get(jobKey);
      if (!storedJob) {
        channel.ack(msg);
        return;
      }

      let currentJob = JSON.parse(storedJob);
      const retryCount = currentJob.retryCount + 1;

      if (retryCount <= currentJob.maxRetries) {
        currentJob.retryCount = retryCount;

        await updateJobStatus(redis, currentJob, "FAILED");

        console.log(
          `🔁 Retrying job ${incomingJob.id} (${retryCount}/${currentJob.maxRetries})`
        );

        channel.nack(msg, false, true);
      } else {
        currentJob.retryCount = retryCount;

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
