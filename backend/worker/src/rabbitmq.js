const amqp = require("amqplib");

let channel;

async function connectRabbitMQ(retries = 10, delay = 5000) {
  while (retries > 0) {
    try {
      console.log("🔌 Connecting to RabbitMQ...");
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();

      await channel.assertQueue(process.env.QUEUE_EMAIL, { durable: true });
      await channel.assertQueue(`${process.env.QUEUE_EMAIL}_dlq`, {
        durable: true,
      });

      console.log("✅ Worker connected to RabbitMQ");
      return channel;
    } catch (err) {
      retries--;
      console.log(
        `⏳ RabbitMQ not ready, retrying in ${delay / 1000}s... (${retries} left)`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error("🚨 Could not connect to RabbitMQ after retries");
}

function getChannel() {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
}

module.exports = connectRabbitMQ;
