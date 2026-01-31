// "use client";

// import { useEffect, useState } from "react";
// import {
//   fetchSummary,
//   fetchHealth,
//   fetchCircuitState,
//   fetchJobs,
//   createJob,
// } from "@/lib/api";

// type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

// export default function Dashboard() {
//   /* ---------- STATE ---------- */
//   const [summary, setSummary] = useState<any>(null);
//   const [health, setHealth] = useState<any>(null);
//   const [circuit, setCircuit] = useState<any>(null);
//   const [jobs, setJobs] = useState<any[]>([]);

//   const [to, setTo] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   /* ---------- DATA LOADER ---------- */
//   async function loadData() {
//     try {
//       const [s, h, c, j] = await Promise.all([
//         fetchSummary(),
//         fetchHealth(),
//         fetchCircuitState(),
//         fetchJobs(),
//       ]);

//       setSummary(s);
//       setHealth(h);
//       setCircuit(c);
//       setJobs(jobs.slice(0, 10)); // FIXED
//     } catch (err) {
//       console.error("Polling failed", err);
//     }
//   }

//   /* ---------- POLLING ---------- */
//   useEffect(() => {
//     let interval: NodeJS.Timeout;

//     async function startPolling() {
//       await loadData();
//       interval = setInterval(loadData, 5000);
//     }

//     function stopPolling() {
//       if (interval) clearInterval(interval);
//     }

//     function handleVisibilityChange() {
//       if (document.hidden) stopPolling();
//       else startPolling();
//     }

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     startPolling();

//     return () => {
//       stopPolling();
//       document.removeEventListener(
//         "visibilitychange",
//         handleVisibilityChange
//       );
//     };
//   }, []);

//   /* ---------- JOB SUBMISSION ---------- */
//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await createJob({ to, message });
//       setTo("");
//       setMessage("");
//       await loadData();
//     } catch {
//       alert("Failed to create job");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (!summary || !health || !circuit) {
//     return <div className="p-8 text-slate-500">Loading dashboard…</div>;
//   }

//   const circuitState = circuit.state as CircuitState;

//   const circuitStyles = {
//     CLOSED: "bg-green-50 text-green-700 ring-green-200",
//     OPEN: "bg-red-50 text-red-700 ring-red-200",
//     HALF_OPEN: "bg-yellow-50 text-yellow-800 ring-yellow-200",
//   } as const;

//   return (
//     <main className="space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight text-slate-800">
//           Job Queue Dashboard
//         </h1>
//         <p className="text-slate-500 text-sm">
//           Monitor system health, queues and job processing in real-time.
//         </p>
//       </div>

//       {/* Create Job */}
//       <form
//         onSubmit={handleSubmit}
//         className="p-6 rounded-xl border bg-white shadow-sm space-y-4"
//       >
//         <h2 className="font-semibold text-slate-700">Create Email Job</h2>

//         <input
//           className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
//           placeholder="Recipient email"
//           value={to}
//           onChange={(e) => setTo(e.target.value)}
//           required
//         />

//         <textarea
//           className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
//           placeholder="Message"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           required
//         />

//         <button
//           type="submit"
//           disabled={loading || circuitState === "OPEN"}
//           className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow hover:scale-105 transition disabled:opacity-40"
//         >
//           {loading
//             ? "Creating..."
//             : circuitState === "OPEN"
//             ? "Circuit Open"
//             : "Create Job"}
//         </button>
//       </form>

//       {/* Health + Circuit */}
//       <div className="p-5 rounded-xl border bg-white shadow-sm flex items-center justify-between">
//         <div>
//           <span className="font-semibold text-slate-700">
//             System Health:
//           </span>{" "}
//           <span
//             className={
//               health.status === "ok"
//                 ? "text-green-600 font-medium"
//                 : "text-red-600 font-medium"
//             }
//           >
//             {health.status.toUpperCase()}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <span className="text-sm font-semibold text-slate-600">
//             Email Circuit:
//           </span>
//           <span
//             className={`px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${circuitStyles[circuitState]}`}
//           >
//             {circuitState}
//           </span>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
//         {Object.entries(summary).map(([key, value]) => {
//           const isDLQ = key === "DEAD_LETTER";

//           const card = (
//             <div
//               className={`p-6 rounded-xl border bg-white shadow-sm text-center
//               hover:shadow-md hover:-translate-y-1 transition
//               ${isDLQ ? "cursor-pointer hover:border-blue-500" : ""}`}
//             >
//               <div className="text-xs uppercase tracking-wide text-slate-500">
//                 {key}
//               </div>
//               <div className="text-3xl font-bold text-slate-800">
//                 {value as number}
//               </div>
//             </div>
//           );

//           return isDLQ ? (
//             <a key={key} href="/dlq">
//               {card}
//             </a>
//           ) : (
//             <div key={key}>{card}</div>
//           );
//         })}
//       </div>

//       {/* Live Jobs */}
//       <div className="border rounded-xl p-6 bg-white shadow-sm">
//         <h2 className="font-semibold mb-4 text-slate-700">
//           Live Jobs (last 10)
//         </h2>

//         <table className="w-full text-sm border-collapse">
//           <thead>
//             <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
//               <th className="p-2 text-left">Job</th>
//               <th className="p-2 text-left">Status</th>
//               <th className="p-2 text-left">Retries</th>
//               <th className="p-2 text-left">Created</th>
//             </tr>
//           </thead>

//           <tbody>
//             {jobs.map((job) => (
//               <tr
//                 key={job.id}
//                 className="border-b hover:bg-slate-50 transition"
//               >
//                 <td className="p-2 font-mono text-xs">
//                   {job.id.slice(0, 8)}…
//                 </td>
//                 <td className="p-2">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-medium
//                       ${
//                         job.status === "COMPLETED"
//                           ? "bg-green-50 text-green-700"
//                           : job.status === "FAILED"
//                           ? "bg-orange-50 text-orange-700"
//                           : job.status === "DEAD_LETTER"
//                           ? "bg-red-50 text-red-700"
//                           : "bg-gray-50 text-gray-700"
//                       }`}
//                   >
//                     {job.status}
//                   </span>
//                 </td>
//                 <td className="p-2">
//                   {job.retryCount}/{job.maxRetries}
//                 </td>
//                 <td className="p-2">
//                   {new Date(job.createdAt).toLocaleTimeString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </main>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import {
  fetchSummary,
  fetchHealth,
  fetchCircuitState,
  fetchJobs,
  createJob,
} from "@/lib/api";
import Link from "next/link";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export default function Dashboard() {
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

      // SAFE JOBS HANDLING
     const jobArray =
  Array.isArray(j)
    ? j
    : Array.isArray(j?.data)
    ? j.data
    : [];

setJobs(jobArray.slice(0, 10));

    } catch (err) {
      console.error("Polling failed", err);
    }
  }

  /* ---------- POLLING ---------- */
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- JOB SUBMISSION ---------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createJob({ to, message });
      setTo("");
      setMessage("");
      await loadData();
    } catch {
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  if (!summary || !health || !circuit) {
    return <div className="p-10 text-slate-500">Loading dashboard…</div>;
  }

  const circuitState = circuit.state as CircuitState;

  const circuitStyles = {
    CLOSED: "bg-green-50 text-green-700 ring-green-200",
    OPEN: "bg-red-50 text-red-700 ring-red-200",
    HALF_OPEN: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  } as const;

 return (
    <main className="space-y-12 mt-8">

      {/* HEADER */}
      <div className="space-y-1">
       <h1 className="text-3xl font-bold text-slate-800">

          Job Queue Dashboard
        </h1>
      <p className="text-slate-600 text-sm">

          Monitor system health and job processing.
        </p>
      </div>

      {/* TOP GRID */}
      <div className="grid lg:grid-cols-2 gap-10 items-start">

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="
            p-8 rounded-2xl
            bg-slate-900
            shadow-[0_10px_30px_rgba(0,0,0,0.5)]
            border border-slate-800
            space-y-5
          "
        >
          <h2 className="text-lg font-semibold text-white">
            Create Email Job
          </h2>

          <input
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700
            placeholder-slate-500 text-white
            focus:ring-2 focus:ring-indigo-500 outline-none transition"
            placeholder="Recipient email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />

          <textarea
            rows={4}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700
            placeholder-slate-500 text-white
            focus:ring-2 focus:ring-indigo-500 outline-none transition"
            placeholder="Write message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button
            disabled={loading || circuitState === "OPEN"}
            className="
              w-full py-3 rounded-lg
              bg-gradient-to-r from-indigo-600 to-blue-600
              font-semibold shadow-lg
              hover:scale-[1.02] transition
              disabled:opacity-40
            "
          >
            {loading ? "Creating..." : "Create Job"}
          </button>
        </form>

        {/* HEALTH CARD */}
        <div className="
          p-8 rounded-2xl
          bg-slate-900
          border border-slate-800
          shadow-[0_8px_24px_rgba(0,0,0,0.4)]
          space-y-4
        ">
          <h2 className="font-semibold text-white">
            System Status
          </h2>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Health</span>
            <span className="text-green-400 font-medium">
              {health.status.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Email Circuit</span>
            <span
  className={`px-3 py-1 rounded-full text-xs font-semibold ${circuitStyles[circuitState]}`}
>
  {circuitState}
</span>

          </div>
        </div>

      </div>

      {/* SUMMARY CARDS */}
     <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
  {Object.entries(summary).map(([key, value]) => {
    const card = (
      <div
        className="
          p-6 rounded-xl
          bg-slate-900
          border border-slate-800
          shadow-md
          text-center
          transition
          hover:-translate-y-1 hover:shadow-lg
        "
      >
        <div className="text-xs uppercase text-slate-500">
          {key}
        </div>
        <div className="text-3xl font-bold text-white">
          {value as number}
        </div>
      </div>
    );

    // 👉 ONLY DEAD_LETTER is clickable
    if (key === "DEAD_LETTER") {
      return (
        <Link
          key={key}
          href="/dlq"
          className="cursor-pointer"
        >
          {card}
        </Link>
      );
    }

    return <div key={key}>{card}</div>;
  })}
</div>


      {/* LIVE JOBS */}
      <div className="
        rounded-2xl
        bg-slate-900
        border border-slate-800
        shadow-md
        p-6
      ">
        <h2 className="font-semibold text-white mb-4">
          Live Jobs (last 10)
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800">
              <th className="p-2 text-left">Job</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Retries</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-slate-800 hover:bg-slate-800/40 transition"
              >
                <td className="p-2 font-mono text-xs text-slate-300">
                  {job.id.slice(0, 8)}…
                </td>
                <td className="p-2 text-slate-200">{job.status}</td>
                <td className="p-2 text-slate-400">
                  {job.retryCount}/{job.maxRetries}
                </td>
                <td className="p-2 text-slate-400">
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