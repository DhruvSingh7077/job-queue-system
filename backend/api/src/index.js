
require("dotenv").config();
const fastify = require("fastify")({ logger: true });

const jobRoutes = require("./routes/jobs");
const { connectRabbitMQ } = require("./rabbitmq");
const { client } = require("./metrics");

async function start() {
  await connectRabbitMQ();

  // Enable CORS (browser -> API)
  await fastify.register(require("@fastify/cors"), {
    origin: [
      "http://localhost:3000",
      "https://job-queue-system.vercel.app", // Replace with your actual Vercel URL
      /\.vercel\.app$/ // Allow all Vercel preview deployments
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  });


  // register routes
  fastify.register(jobRoutes);

  // Prometheus metrics
  fastify.get("/metrics", async (request, reply) => {
    reply.header("Content-Type", client.register.contentType);
    return client.register.metrics();
  });

  // Start server
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
  console.log("🚀 API running on port 3000");
}

start();