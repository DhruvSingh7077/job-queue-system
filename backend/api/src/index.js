const fastify = require("fastify")();
require("dotenv").config();

const jobRoutes = require("./routes/jobs");
const { connectRabbitMQ } = require("./rabbitmq");
const { client } = require("./metrics");

async function start() {
  await connectRabbitMQ();

  // register routes
  fastify.register(jobRoutes);

 // expose Prometheus metrics
  fastify.get("/metrics", async (request, reply) => {
    reply.header("Content-Type", client.register.contentType);
    return client.register.metrics();
  });
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
  console.log("API running on port 3000");

}

start();
