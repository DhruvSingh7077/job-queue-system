async function updateJobStatus(redis, job, newStatus) {
  const oldStatus = job.status;
  const jobId = job.id;
  const createdAt = job.createdAt;

  const updatedJob = {
    ...job,
    status: newStatus
  };

  await redis.multi()
    .zrem(`jobs:status:${oldStatus}`, jobId)
    .zadd(`jobs:status:${newStatus}`, createdAt, jobId)
    .set(`job:${jobId}`, JSON.stringify(updatedJob))
    .exec();

  return updatedJob;
}

module.exports = { updateJobStatus };
