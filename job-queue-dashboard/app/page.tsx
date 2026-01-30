"use client";

import { useEffect, useState } from "react";
import {
  fetchSummary,
  fetchHealth,
  fetchCircuitState,
  fetchJobs,
  createJob,
} from "@/lib/api";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export default function Dashboard() {
  /* ---------- STATE ---------- */
  const [summary, setSummary] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [circuit, setCircuit] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- DATA LOADER ---------- */
  async function loadData() {
    try {
      const [s, h, c, j] = await Promise.all([
        fetchSummary(),
        fetchHealth(),
        fetchCircuitState(),
        fetchJobs(),
      ]);

      setSummary(s);
      setHealth(h);
      setCircuit(c);
      setJobs(jobs.slice(0, 10)); // show latest 10 jobs
    } catch (err) {
      console.error("Polling failed", err);
    }
  }

 /* ---------- POLLING (pause when tab hidden) ---------- */
useEffect(() => {
  let interval: NodeJS.Timeout;

  async function startPolling() {
    await loadData(); // immediate refresh
    interval = setInterval(loadData, 5000);
  }

  function stopPolling() {
    if (interval) clearInterval(interval);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopPolling();
    } else {
      startPolling();
    }
  }

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  startPolling();

  return () => {
    stopPolling();
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, []);

  /* ---------- JOB SUBMISSION ---------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createJob({ to, message });
      setTo("");
      setMessage("");
      await loadData(); // refresh immediately
    } catch (err) {
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  if (!summary || !health || !circuit) {
    return <div className="p-6">Loading...</div>;
  }

  const circuitState = circuit.state as CircuitState;

  const circuitStyles = {
    CLOSED: "bg-green-100 text-green-700",
    OPEN: "bg-red-100 text-red-700",
    HALF_OPEN: "bg-yellow-100 text-yellow-800",
  } as const;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Job Queue Dashboard</h1>

      {/* Create Job */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded space-y-4"
      >
        <h2 className="font-semibold">Create Email Job</h2>

        <input
          className="w-full p-2 border rounded"
          placeholder="Recipient email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />

        <textarea
          className="w-full p-2 border rounded"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading || circuitState === "OPEN"}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : circuitState === "OPEN"
            ? "Circuit Open"
            : "Create Job"}
        </button>
      </form>

      {/* System Health + Circuit */}
      <div className="p-4 rounded border flex items-center justify-between">
        <div>
          <span className="font-semibold">System Health:</span>{" "}
          <span
            className={
              health.status === "ok"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {health.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            Email Circuit:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              circuitStyles[circuitState]
            }`}
          >
            {circuitState}
          </span>
        </div>
      </div>

      {/* Job Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(summary).map(([key, value]) => {
          const isDLQ = key === "DEAD_LETTER";

          const card = (
            <div
              className={`p-4 border rounded text-center transition
                ${
                  isDLQ
                    ? "cursor-pointer hover:border-blue-500 hover:bg-blue-50"
                    : ""
                }`}
            >
              <div className="text-sm text-gray-500">{key}</div>
              <div className="text-2xl font-bold">
                {value as number}
              </div>
            </div>
          );

          return isDLQ ? (
            <a key={key} href="/dlq">
              {card}
            </a>
          ) : (
            <div key={key}>{card}</div>
          );
        })}
      </div>

      {/* Live Job List */}
      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">
          Live Jobs (last 10)
        </h2>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Job</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Retries</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b">
                <td className="p-2 font-mono text-xs">
                  {job.id.slice(0, 8)}…
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs
                      ${
                        job.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : job.status === "FAILED"
                          ? "bg-orange-100 text-orange-700"
                          : job.status === "DEAD_LETTER"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    `}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="p-2">
                  {job.retryCount}/{job.maxRetries}
                </td>
                <td className="p-2">
                  {new Date(job.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
