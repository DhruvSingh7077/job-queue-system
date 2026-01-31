async function updateJobStatus(redis, job, newStatus) {
  const oldStatus = job.status;
  const jobId = job.id;
  const timestamp = Date.now();

  const updatedJob = {
    ...job,
    status: newStatus,
    updatedAt: timestamp,
  };

  await redis
    .multi()
    .zrem(`jobs:status:${oldStatus}`, jobId)
    .zadd(`jobs:status:${newStatus}`, timestamp, jobId)
    .set(`job:${jobId}`, JSON.stringify(updatedJob))
    .exec();

  // 🔥 CRITICAL: mutate original reference
  job.status = newStatus;

  return updatedJob;
}

module.exports = { updateJobStatus };
