const { v4: uuidv4 } = require("uuid");
const redis = require("../redis");
const { getChannel } = require("../rabbitmq");

async function createJob(payload) {
  const jobId = uuidv4();

  const job = {
    id: jobId,
    type: "email",
    payload,
    status: "PENDING"
  };

  await redis.set(`job:${jobId}`, JSON.stringify(job));

  const channel = getChannel();
  channel.sendToQueue(
    "email_queue",
    Buffer.from(JSON.stringify(job)),
    { persistent: true }
  );

  return job;
}

async function getAllJobs() {
  const keys = await redis.keys("job:*");
  const jobs = [];

  for (const key of keys) {
    const data = await redis.get(key);
    jobs.push(JSON.parse(data));
  }

  return jobs;
}

module.exports = { createJob, getAllJobs };
