// "use client";

// import { useEffect, useState } from "react";
// import {
//   fetchJobs,
//   retryJob,
//   fetchCircuitState,
// } from "@/lib/api";

// type Job = {
//   id: string;
//   status: string;
//   retryCount: number;
//   maxRetries: number;
// };

// type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

// export default function DLQPage() {
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [circuitState, setCircuitState] =
//     useState<CircuitState>("CLOSED");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   async function load() {
//     try {
//       setLoading(true);
//       setError(null);

//       const [jobsRes, circuitRes] = await Promise.all([
//         fetchJobs("DEAD_LETTER"),
//         fetchCircuitState(),
//       ]);

//       setJobs(jobsRes.data || []);
//       setCircuitState(circuitRes.state as CircuitState);
//     } catch (err: any) {
//       setError(err.message || "Failed to load DLQ");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleRetry(jobId: string) {
//     try {
//       await retryJob(jobId);
//       await load();
//     } catch (err: any) {
//       alert(err.message || "Retry failed");
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   /**
//    * 🔒 Retry allowed ONLY during HALF_OPEN
//    */
//   const canRetry = circuitState === "HALF_OPEN";

//   const circuitColor =
//     circuitState === "OPEN"
//       ? "text-red-600"
//       : circuitState === "HALF_OPEN"
//       ? "text-yellow-500"
//       : "text-green-600";

//   return (
//     <main className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Dead Letter Queue</h1>

//       {/* Circuit info */}
//       <div className="text-sm">
//         Email Circuit:{" "}
//         <span className={circuitColor}>
//           {circuitState}
//         </span>
//       </div>

//       {loading && <p>Loading…</p>}
//       {error && <p className="text-red-600">{error}</p>}

//       {!loading && jobs.length === 0 && (
//         <p>No dead letter jobs 🎉</p>
//       )}

//       {jobs.length > 0 && (
//         <>
//           {!canRetry && (
//             <p className="text-sm text-slate-600">
//               Retry enabled only when circuit is HALF_OPEN
//             </p>
//           )}

//           <table className="w-full border border-collapse">
//             <thead>
//   <tr className="bg-slate-200 text-slate-700">

//                 <th className="border p-3 text-left font-semibold">Job ID</th>
// <th className="border p-3 text-center font-semibold">Retries</th>
// <th className="border p-3 text-center font-semibold">Action</th>

//               </tr>
//             </thead>
//             <tbody className="bg-white">
//               {jobs.map((job) => (
//                 <tr
//       key={job.id}
//       className="border-b hover:bg-slate-50 transition"
//     >
//                   <td className="border p-3 text-xs font-mono text-slate-700">
//         {job.id}
//       </td>
//                   <td className="border p-3 text-center text-slate-700">
//         {job.retryCount}/{job.maxRetries}
//       </td>
//                   <td className="border p-3 text-center">
//                     <button
//                       disabled={!canRetry}
//                       onClick={() => handleRetry(job.id)}
//                       className={`px-3 py-1 rounded text-white ${
//                         canRetry
//                           ? "bg-green-600 hover:bg-green-700"
//                           : "bg-gray-500 cursor-not-allowed"
//                       }`}
//                       title={
//                         canRetry
//                           ? "Retry job (HALF_OPEN probe)"
//                           : `Retry disabled: circuit is ${circuitState}`
//                       }
//                     >
//                       Retry
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </>
//       )}
//     </main>
//   );
// }
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
      ? "text-red-400"
      : circuitState === "HALF_OPEN"
      ? "text-yellow-400"
      : "text-green-400";

  return (
   <main className="min-h-screen p-8">

      <div
        className="
          max-w-6xl mx-auto
          bg-slate-900
          border border-slate-800
          rounded-2xl
          shadow-[0_20px_40px_rgba(0,0,0,0.45)]
          p-8
          space-y-6
        "
      >
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dead Letter Queue
          </h1>

          <div className="text-sm text-slate-300 mt-1">
            Email Circuit:{" "}
            <span className={`font-semibold ${circuitColor}`}>
              {circuitState}
            </span>
          </div>
        </div>

        {loading && (
          <p className="text-slate-400">Loading…</p>
        )}

        {error && (
          <p className="text-red-400">{error}</p>
        )}

        {!loading && jobs.length === 0 && (
          <p className="text-slate-400">
            No dead letter jobs 🎉
          </p>
        )}

        {jobs.length > 0 && (
          <>
            {!canRetry && (
              <p className="text-sm text-slate-400">
                Retry enabled only when circuit is{" "}
                <span className="font-medium text-slate-300">
                  HALF_OPEN
                </span>
              </p>
            )}

            {/* TABLE */}
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    <th className="p-3 text-left">
                      Job ID
                    </th>
                    <th className="p-3 text-center">
                      Retries
                    </th>
                    <th className="p-3 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-slate-900">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="
                        border-t border-slate-800
                        hover:bg-slate-800/40
                        transition
                      "
                    >
                      <td className="p-3 text-xs font-mono text-slate-300">
                        {job.id}
                      </td>

                      <td className="p-3 text-center text-slate-300">
                        {job.retryCount}/{job.maxRetries}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          disabled={!canRetry}
                          onClick={() => handleRetry(job.id)}
                          className={`
                            px-4 py-1.5 rounded-md
                            text-sm font-medium
                            transition
                            ${
                              canRetry
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-slate-700 text-slate-400 cursor-not-allowed"
                            }
                          `}
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
            </div>
          </>
        )}
      </div>
    </main>
  );
}

