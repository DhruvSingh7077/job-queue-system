const connectRabbitMQ = require("./rabbitmq");
const redis = require("./redis");
require("dotenv").config();

async function startWorker() {
  const channel = await connectRabbitMQ();

  channel.consume("email_queue", async (msg) => {
    const job = JSON.parse(msg.content.toString());
    console.log("Processing job:", job.id);

    try {
      await redis.set(
        `job:${job.id}`,
        JSON.stringify({ ...job, status: "PROCESSING" })
      );

      // simulate work
      await new Promise((res) => setTimeout(res, 2000));

      await redis.set(
        `job:${job.id}`,
        JSON.stringify({ ...job, status: "COMPLETED" })
      );

      channel.ack(msg);
      console.log("Job completed:", job.id);
    } catch (err) {
      console.error("Job failed:", err);
      channel.nack(msg);
    }
  });
}

startWorker();
