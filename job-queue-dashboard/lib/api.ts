const API_URL = "/api/proxy";


/**
 * Job summary counts
 */
export async function fetchSummary() {
  const res = await fetch(`${API_URL}/jobs/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch job summary");
  }

  return res.json();
}


/**
 * Fetch jobs by status (default: PROCESSING)
 */
export async function fetchJobs(status: string = "PROCESSING") {
  const res = await fetch(
    `${API_URL}/jobs?status=${status}&limit=10`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}


/**
 * Retry a DEAD_LETTER job
 */
export async function retryJob(jobId: string) {
  const res = await fetch(
    `${API_URL}/jobs/${jobId}/retry`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Retry failed");
  }

  return res.json();
}

/**
 * Circuit breaker state
 */
export async function fetchCircuitState() {
  const res = await fetch(`${API_URL}/circuit`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch circuit state");
  }

  return res.json();
}

/**
 * System health
 */
export async function fetchHealth() {
  const res = await fetch(`${API_URL}/health`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch health status");
  }

  return res.json();
}
export async function createJob(payload: {
  to: string;
  message: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/jobs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "email",
        payload,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create job");
  }

  return res.json();
}
