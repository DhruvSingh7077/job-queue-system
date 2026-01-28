import {
  fetchSummary,
  fetchHealth,
  fetchCircuitState
} from "@/lib/api";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";
 
export default async function Dashboard() {
  const summary = await fetchSummary();
  const health = await fetchHealth();
  const circuit = await fetchCircuitState();

const circuitState = circuit.state as CircuitState;
 // CLOSED | OPEN | HALF_OPEN

  const circuitStyles = {
    CLOSED: "bg-green-100 text-green-700",
    OPEN: "bg-red-100 text-red-700",
    HALF_OPEN: "bg-yellow-100 text-yellow-800",
  } as const;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Job Queue Dashboard</h1>

      {/* System Health + Circuit */}
      <div className="p-4 rounded border flex items-center justify-between">
        {/* Health */}
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

        {/* Circuit Breaker */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            Email Circuit:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              circuitStyles[circuitState] ??
              "bg-gray-100 text-gray-700"
            }`}
            title="Circuit breaker state for email service"
          >
            {circuitState}
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
