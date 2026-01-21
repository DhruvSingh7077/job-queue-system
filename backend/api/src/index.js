const fastify = require("fastify")();
const jobRoutes = require("./routes/jobs");
const { connectRabbitMQ } = require("./rabbitmq");
require("dotenv").config();

async function start() {
  await connectRabbitMQ();

  fastify.register(jobRoutes);

  await fastify.listen({ port: 3000, host: "0.0.0.0" });
  console.log("API running on port 3000");
}

start();
