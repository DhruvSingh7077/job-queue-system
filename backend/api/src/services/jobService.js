const { v4: uuidv4 } = require("uuid");
const redis = require("../redis");
const { getChannel } = require("../rabbitmq");
const {
  jobsCreatedCounter,
  jobCreationDuration
} = require("../metrics");


async function createJob(payload) {
   const endTimer = jobCreationDuration.startTimer();

  const jobId = uuidv4();

   const job = {
    id: jobId,
    type: "email",
    payload,
    status: "PENDING",
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date().toISOString()
};
  // store job in redis
  await redis.set(`job:${jobId}`, JSON.stringify(job));
 
 // publish job
  const channel = getChannel();
  channel.sendToQueue(
    process.env.QUEUE_EMAIL,
    Buffer.from(JSON.stringify(job)),
    { persistent: true }
  );
   jobsCreatedCounter.inc(); //  increment metric
  endTimer();               //  record duration

  return job;
}
async function getJobById(jobId) {
  const job = await redis.get(`job:${jobId}`);
  if (!job) return null;
  return JSON.parse(job);
}


async function getAllJobs() {
  const keys = await redis.keys("job:*");
  const jobs = [];

  for (const key of keys) {
    const job = await redis.get(key);
    jobs.push(JSON.parse(job));
  }

  return jobs;
}

module.exports = {
  createJob,
  getJobById,
  getAllJobs
};