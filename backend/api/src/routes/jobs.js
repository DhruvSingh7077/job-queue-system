const { createJob, getAllJobs } = require("../services/jobService");

async function routes(fastify) {
  fastify.post("/jobs", async (request, reply) => {
    const job = await createJob(request.body);
    reply.send(job);
  });

  fastify.get("/jobs", async () => {
    return getAllJobs();
  });
}

module.exports = routes;
