const amqp = require("amqplib");

let channel;

/**
 * Connect to RabbitMQ with retry logic
 */
async function connectRabbitMQ(retries = 5, delayMs = 5000) {
  try {
    console.log("🔌 Connecting to RabbitMQ...");

    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(process.env.QUEUE_EMAIL, {
      durable: true
    });

    console.log("✅ Connected to RabbitMQ and queue asserted");
  } catch (error) {
    console.error(
      `❌ RabbitMQ connection failed. Retries left: ${retries}`,
      error.message
    );

    if (retries === 0) {
      console.error("🚨 Could not connect to RabbitMQ. Exiting.");
      throw error;
    }

    console.log(`⏳ Retrying RabbitMQ connection in ${delayMs / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    return connectRabbitMQ(retries - 1, delayMs);
  }
}

/**
 * Get active RabbitMQ channel
 */
function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
}

module.exports = {
  connectRabbitMQ,
  getChannel
};
