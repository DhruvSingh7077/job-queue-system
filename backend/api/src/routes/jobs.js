const {
  createJob,
  getJobById,
  getAllJobs,
  getJobSummary,
  retryDeadLetterJob
} = require("../services/jobService");

const { getHealthStatus } = require("../services/healthService");

async function routes(fastify) {
  fastify.post("/jobs", async (request, reply) => {
    const job = await createJob(request.body);
    reply.send(job);
  });

  fastify.get("/jobs", async (request) => {
    const { status, limit, cursor } = request.query;
    return getAllJobs({ status, limit, cursor });
  });

  // ✅ STATIC route MUST come before dynamic route
  fastify.get("/jobs/summary", async () => {
    return getJobSummary();
  });
fastify.get("/health", async (request, reply) => {
  const health = await getHealthStatus();

  if (health.status !== "ok") {
    reply.code(503); // Service Unavailable
  }

  return health;
});

  // ❗ Dynamic route LAST
  fastify.get("/jobs/:id", async (request, reply) => {
    const job = await getJobById(request.params.id);

    if (!job) {
      reply.code(404).send({ error: "Job not found" });
      return;
    }

    reply.send(job);
  });

  fastify.post("/jobs/:id/retry", async (request, reply) => {
  try {
    const job = await retryDeadLetterJob(request.params.id);
    reply.send(job);
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
});

}

module.exports = routes;
