"use client";

import { useEffect, useState } from "react";
import {
  fetchJobs,
  retryJob,
  fetchCircuitState,
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
  const [circuitState, setCircuitState] =
    useState<CircuitState>("CLOSED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const [jobsRes, circuitRes] = await Promise.all([
        fetchJobs("DEAD_LETTER"),
        fetchCircuitState(),
      ]);

      setJobs(jobsRes.data || []);
      setCircuitState(circuitRes.state as CircuitState);
    } catch (err: any) {
      setError(err.message || "Failed to load DLQ");
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(jobId: string) {
    try {
      await retryJob(jobId);
      await load();
    } catch (err: any) {
      alert(err.message || "Retry failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  /**
   * 🔒 Retry allowed ONLY during HALF_OPEN
   */
  const canRetry = circuitState === "HALF_OPEN";

  const circuitColor =
    circuitState === "OPEN"
      ? "text-red-600"
      : circuitState === "HALF_OPEN"
      ? "text-yellow-500"
      : "text-green-600";

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dead Letter Queue</h1>

      {/* Circuit info */}
      <div className="text-sm">
        Email Circuit:{" "}
        <span className={circuitColor}>
          {circuitState}
        </span>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && jobs.length === 0 && (
        <p>No dead letter jobs 🎉</p>
      )}

      {jobs.length > 0 && (
        <>
          {!canRetry && (
            <p className="text-sm text-gray-400">
              Retry enabled only when circuit is HALF_OPEN
            </p>
          )}

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
                      disabled={!canRetry}
                      onClick={() => handleRetry(job.id)}
                      className={`px-3 py-1 rounded text-white ${
                        canRetry
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-500 cursor-not-allowed"
                      }`}
                      title={
                        canRetry
                          ? "Retry job (HALF_OPEN probe)"
                          : `Retry disabled: circuit is ${circuitState}`
                      }
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
