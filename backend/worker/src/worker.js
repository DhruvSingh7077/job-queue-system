require("dotenv").config();
const connectRabbitMQ = require("./rabbitmq");
const redis = require("./redis");

async function startWorker() {
  const channel = await connectRabbitMQ();

channel.consume(process.env.QUEUE_EMAIL, async (msg) => {
  const incomingJob = JSON.parse(msg.content.toString());
  const jobKey = `job:${incomingJob.id}`;

  console.log("Processing job:", incomingJob.id);
  try {
    // fetch latest job from Redis (source of truth)
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

    // simulate work
    await new Promise((res)=> setTimeout(res, 2000));
  
    //update status -> COMPLETED
    await redis.set(
      jobKey,
      JSON.stringify({ ...currentJob, status: "COMPLETED" })
    );
 console.log("Job completed:", incomingJob.id);

      channel.ack(msg);
    }catch (err) {
  console.error("Job failed:", incomingJob.id, err.message);

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
        retryCount
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
        retryCount
      })
    );

    channel.sendToQueue(
      `${process.env.QUEUE_EMAIL}_dlq`,
      Buffer.from(JSON.stringify(currentJob)),
      { persistent: true }
    );

    console.log("Job moved to DLQ:", incomingJob.id);
    channel.ack(msg);
  }}
})

}

startWorker();