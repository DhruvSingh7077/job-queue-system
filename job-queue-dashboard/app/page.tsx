import {
  fetchSummary,
  fetchHealth,
  fetchCircuitState
} from "@/lib/api";

export default async function Dashboard() {
  const summary = await fetchSummary();
  const health = await fetchHealth();
  const circuit = await fetchCircuitState();

  const isCircuitOpen = circuit.state === "OPEN";

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Job Queue Dashboard</h1>

      {/* System Health */}
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

        {/* Circuit Breaker Badge */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            Email Circuit:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium
              ${
                isCircuitOpen
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }
            `}
          >
            {circuit.state}
          </span>
        </div>
      </div>

      {/* Job Summary */}
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
