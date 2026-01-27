// const { v4: uuidv4 } = require("uuid");
// const redis = require("../redis");
// const { getChannel } = require("../rabbitmq");
// const {
//   jobsCreatedCounter,
//   jobCreationDuration
// } = require("../metrics");


// async function createJob(payload) {
//    const endTimer = jobCreationDuration.startTimer();

//   const jobId = uuidv4();

//    const job = {
//     id: jobId,
//     type: "email",
//     payload,
//     status: "PENDING",
//     retryCount: 0,
//     maxRetries: 3,
//     createdAt: new Date().toISOString()
// };
//   // store job in redis
//   await redis.set(`job:${jobId}`, JSON.stringify(job));
 
//  // publish job
//   const channel = getChannel();
//   channel.sendToQueue(
//     process.env.QUEUE_EMAIL,
//     Buffer.from(JSON.stringify(job)),
//     { persistent: true }
//   );
//    jobsCreatedCounter.inc(); //  increment metric
//   endTimer();               //  record duration

//   return job;
// }
// async function getJobById(jobId) {
//   const job = await redis.get(`job:${jobId}`);
//   if (!job) return null;
//   return JSON.parse(job);
// }


// async function getAllJobs() {
//   const keys = await redis.keys("job:*");
//   const jobs = [];

//   for (const key of keys) {
//     const job = await redis.get(key);
//     jobs.push(JSON.parse(job));
//   }

//   return jobs;
// }

// module.exports = {
//   createJob,
//   getJobById,
//   getAllJobs
// };
const { v4: uuidv4 } = require("uuid");
const redis = require("../redis");
const { getChannel } = require("../rabbitmq");
const {
  jobsCreatedCounter,
  jobCreationDuration
} = require("../metrics");

/**
 * Create Job
 */
async function createJob(payload) {
  const endTimer = jobCreationDuration.startTimer();

  const jobId = uuidv4();
  const createdAt = Date.now(); // numeric timestamp for ZSET score

  const job = {
    id: jobId,
    type: "email",
    payload,
    status: "QUEUED",
    retryCount: 0,
    maxRetries: 3,
    createdAt
  };

  /**
   * ✅ Store job + index it by status
   */
  await redis.multi()
    .set(`job:${jobId}`, JSON.stringify(job))
    .zadd(`jobs:status:QUEUED`, createdAt, jobId)
    .exec();

  /**
   * Publish job to RabbitMQ
   */
  const channel = getChannel();
  channel.sendToQueue(
    process.env.QUEUE_EMAIL,
    Buffer.from(JSON.stringify(job)),
    { persistent: true }
  );

  jobsCreatedCounter.inc();
  endTimer();

  return job;
}

/**
 * Get Job by ID
 */
async function getJobById(jobId) {
  const job = await redis.get(`job:${jobId}`);
  if (!job) return null;
  return JSON.parse(job);
}

/**
 * ✅ Production-grade Job Listing
 * Supports:
 * - status filter
 * - pagination
 */
async function getAllJobs({
  status = "COMPLETED",
  limit = 20,
  cursor
} = {}) {
  const effectiveCursor = cursor ? Number(cursor) : Date.now();

  const jobIds = await redis.zrevrangebyscore(
    `jobs:status:${status}`,
    effectiveCursor,
    "-inf",
    "LIMIT",
    0,
    limit
  );

  if (jobIds.length === 0) {
    return { data: [], nextCursor: null };
  }

  const jobs = await Promise.all(
    jobIds.map(async (id) => {
      const job = await redis.get(`job:${id}`);
      return job ? JSON.parse(job) : null;
    })
  );

  const filtered = jobs.filter(Boolean);

  return {
    data: filtered,
    nextCursor: filtered[filtered.length - 1].createdAt
  };
}
async function getJobSummary() {
  const statuses = [
    "QUEUED",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "DEAD_LETTER"
  ];

  const result = {};

  for (const status of statuses) {
    const count = await redis.zcard(`jobs:status:${status}`);
    result[status] = count;
  }

  return result;
}


module.exports = {
  createJob,
  getJobById,
  getAllJobs,
  getJobSummary
};
