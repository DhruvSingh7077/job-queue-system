require("dotenv").config();
const http = require("http");
const connectRabbitMQ = require("./rabbitmq");
const redis = require("./redis");

const {
  client,
  jobsProcessedTotal,
  jobsFailedTotal,
  jobProcessingDuration,
} = require("./metrics");

/**
 * Expose /metrics for Prometheus
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

    console.log("Processing job:", incomingJob.id);

    // 🔥 START TIMER (IMPORTANT)
    const endTimer = jobProcessingDuration.startTimer();

    try {
      // fetch job from Redis
      const storedJob = await redis.get(jobKey);
      if (!storedJob) {
        throw new Error("Job not found in Redis");
      }

      const currentJob = JSON.parse(storedJob);

      // update status → PROCESSING
      await redis.set(
        jobKey,
        JSON.stringify({ ...currentJob, status: "PROCESSING" })
      );
// // 👇 ADD HERE
// if (incomingJob.payload?.shouldFail === true) {
//   throw new Error("Forced failure for testing");
// }
      // simulate work
      await new Promise((res) => setTimeout(res, 2000));

      // update status → COMPLETED
      await redis.set(
        jobKey,
        JSON.stringify({ ...currentJob, status: "COMPLETED" })
      );

      // ✅ SUCCESS METRICS
      jobsProcessedTotal.inc();
      endTimer();

      console.log("Job completed:", incomingJob.id);
      channel.ack(msg);
    } catch (err) {
      console.error("Job failed:", incomingJob.id, err.message);

      // ❌ FAILURE METRICS
      jobsFailedTotal.inc();
      endTimer();

      const storedJob = await redis.get(jobKey);
      if (!storedJob) {
        channel.nack(msg, false, false);
        return;
      }

      const currentJob = JSON.parse(storedJob);
      const retryCount = currentJob.retryCount + 1;

      if (retryCount <= currentJob.maxRetries) {
        // update retry count
        await redis.set(
          jobKey,
          JSON.stringify({
            ...currentJob,
            status: "FAILED",
            retryCount,
          })
        );

        console.log(
          `Retrying job ${incomingJob.id} (${retryCount}/${currentJob.maxRetries})`
        );

        // requeue job
        channel.nack(msg, false, true);
      } else {
        // move to DLQ
        await redis.set(
          jobKey,
          JSON.stringify({
            ...currentJob,
            status: "DEAD_LETTER",
            retryCount,
          })
        );

        channel.sendToQueue(
          `${process.env.QUEUE_EMAIL}_dlq`,
          Buffer.from(JSON.stringify(currentJob)),
          { persistent: true }
        );

        console.log("Job moved to DLQ:", incomingJob.id);
        channel.ack(msg);
      }
    }
  });
}

startWorker();
