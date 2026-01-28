
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
async function retryDeadLetterJob(jobId) {
  const jobKey = `job:${jobId}`;
  const jobData = await redis.get(jobKey);

  if (!jobData) {
    throw new Error("Job not found");
  }

  const job = JSON.parse(jobData);

  if (job.status !== "DEAD_LETTER") {
    throw new Error("Only DEAD_LETTER jobs can be retried");
  }

  const updatedJob = {
    ...job,
    status: "QUEUED",
    retryCount: 0,
    createdAt: Date.now()
  };

  await redis.multi()
    .zrem("jobs:status:DEAD_LETTER", jobId)
    .zadd("jobs:status:QUEUED", updatedJob.createdAt, jobId)
    .set(jobKey, JSON.stringify(updatedJob))
    .exec();

  const channel = getChannel();
  channel.sendToQueue(
    process.env.QUEUE_EMAIL,
    Buffer.from(JSON.stringify(updatedJob)),
    { persistent: true }
  );

  return updatedJob;
}

module.exports = {
  createJob,
  getJobById,
  getAllJobs,
  getJobSummary,
  retryDeadLetterJob
};
