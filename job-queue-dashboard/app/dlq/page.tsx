"use client";

import { useEffect, useState } from "react";
import {
  fetchJobs,
  retryJob,
  fetchCircuitState
} from "@/lib/api";

type Job = {
  id: string;
  status: string;
  retryCount: number;
  maxRetries: number;
};

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export default function DLQPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [circuitState, setCircuitState] = useState<CircuitState>("CLOSED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const [jobsRes, circuitRes] = await Promise.all([
        fetchJobs("DEAD_LETTER"),
        fetchCircuitState(),
        console.log("Fetching DLQ from", process.env.NEXT_PUBLIC_API_URL)

      ]);

      setJobs(jobsRes.data || []);
      setCircuitState(circuitRes.state as CircuitState);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(jobId: string) {
    try {
      await retryJob(jobId);
      await load(); // refresh list
    } catch (err: any) {
      alert(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const retryDisabled = circuitState === "OPEN";

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dead Letter Queue</h1>

      {/* Circuit info */}
      <div className="text-sm">
        Email Circuit:{" "}
        <span
          className={
            circuitState === "OPEN"
              ? "text-red-600"
              : "text-green-600"
          }
        >
          {circuitState}
        </span>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && jobs.length === 0 && (
        <p>No dead letter jobs 🎉</p>
      )}

      {jobs.length > 0 && (
        <table className="w-full border border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th className="border p-2">Job ID</th>
              <th className="border p-2">Retries</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="border p-2 text-xs">
                  {job.id}
                </td>
                <td className="border p-2 text-center">
                  {job.retryCount}/{job.maxRetries}
                </td>
                <td className="border p-2 text-center">
                  <button
                    disabled={retryDisabled}
                    onClick={() => handleRetry(job.id)}
                    className={`px-3 py-1 rounded text-white
                      ${
                        retryDisabled
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }
                    `}
                    title={
                      retryDisabled
                        ? "Retry disabled: circuit breaker OPEN"
                        : "Retry job"
                    }
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
