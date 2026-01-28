const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
 * Fetch jobs (optionally by status)
 */
export async function fetchJobs(status?: string) {
  const url = status
    ? `${API_URL}/jobs?status=${status}`
    : `${API_URL}/jobs`;

  const res = await fetch(url, {
    cache: "no-store",
  });

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
