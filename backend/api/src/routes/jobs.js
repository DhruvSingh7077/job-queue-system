const {
  createJob,
  getJobById,
  getAllJobs
} = require("../services/jobService");

async function routes(fastify) {
  fastify.post("/jobs", async (request, reply) => {
    const job = await createJob(request.body);
    reply.send(job);
  });
 
  fastify.get("/jobs", async () => {
    return getAllJobs();
  });

  fastify.get("/jobs/:id", async (request, reply) => {
    const job = await getJobById(request.params.id);

    if (!job) {
      reply.code(404).send({ error: "Job not found" });
      return;
    }

    reply.send(job);
  });
}

module.exports = routes
