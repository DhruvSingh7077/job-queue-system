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

      console.log("✅ Connected to RabbitMQ");
      return channel;
    } catch (err) {
      retries--;
      console.error(
        `❌ RabbitMQ connection failed. Retries left: ${retries}`,
        err.message
      );
      if (retries === 0) throw err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

function getChannel() {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
