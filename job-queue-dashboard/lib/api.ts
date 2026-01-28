const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchSummary() {
  const res = await fetch(`${API_URL}/jobs/summary`, {
    cache: "no-store",
  });
  return res.json();
}

export async function fetchJobs(status?: string) {
  const url = status
    ? `${API_URL}/jobs?status=${status}`
    : `${API_URL}/jobs`;

  const res = await fetch(url, {
    cache: "no-store",
  });
  return res.json();
}
export async function fetchCircuitState() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/circuit`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch circuit state");
  }

  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/health`, {
    cache: "no-store",
  });
  return res.json();
}
