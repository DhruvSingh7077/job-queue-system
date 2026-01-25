const client = require("prom-client");

// collect default system metrics
client.collectDefaultMetrics();

// jobs processed counter
const jobsProcessedTotal = new client.Counter({
  name: "worker_jobs_processed_total",
  help: "Total number of jobs processed by worker",
});

// jobs failed counter
const jobsFailedTotal = new client.Counter({
  name: "worker_jobs_failed_total",
  help: "Total number of jobs failed by worker",
});

// job processing duration
const jobProcessingDuration = new client.Histogram({
  name: "worker_job_processing_duration_seconds",
  help: "Time taken to process a job",
  buckets: [0.5, 1, 2, 5, 10],
});

module.exports = {
  client,
  jobsProcessedTotal,
  jobsFailedTotal,
  jobProcessingDuration,
};
