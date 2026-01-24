const client = require("prom-client");

// collect default Node.js metrics (CPU, memory, event loop)
client.collectDefaultMetrics();

// Counter: total jobs created
const jobsCreatedCounter = new client.Counter({
  name: "jobs_created_total",
  help: "Total number of jobs created"
});

// Histogram: job creation duration
const jobCreationDuration = new client.Histogram({
  name: "job_creation_duration_seconds",
  help: "Time taken to create a job",
  buckets: [0.1, 0.3, 0.5, 1, 2]
});

module.exports = {
  client,
  jobsCreatedCounter,
  jobCreationDuration
};
