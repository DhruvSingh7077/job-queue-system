const amqp = require("amqplib");

async function connectRabbitMQ(retries = 5) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(process.env.QUEUE_EMAIL, { durable: true });
    console.log("✅ Worker connected to RabbitMQ");
    return channel;
  } catch (err) {
    if (retries === 0) throw err;
    console.log("⏳ RabbitMQ not ready, retrying in 5s...");
    await new Promise((res) => setTimeout(res, 5000));
    return connectRabbitMQ(retries - 1);
  }
}

module.exports = connectRabbitMQ;
