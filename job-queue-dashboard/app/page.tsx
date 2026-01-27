import { fetchSummary, fetchHealth } from "@/lib/api";


export default async function Dashboard() {
  const summary = await fetchSummary();
  const health = await fetchHealth();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Job Queue Dashboard</h1>

      {/* Health */}
      <div className="p-4 rounded border">
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

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(summary).map(([key, value]) => (
          <div
            key={key}
            className="p-4 border rounded text-center"
          >
            <div className="text-sm text-gray-500">{key}</div>
            <div className="text-2xl font-bold">
              {value as number}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
