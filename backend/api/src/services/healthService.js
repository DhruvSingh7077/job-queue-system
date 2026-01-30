const redis = require("../redis");
const { getChannel } = require("../rabbitmq");

async function getHealthStatus() {
  const health = {
    status: "ok",
    redis: "unknown",
    rabbitmq: "unknown",
    timestamp: Date.now(),
  };

  // 🔴 Redis check
  try {
    await redis.ping();
    health.redis = "connected";
  } catch (err) {
    health.status = "degraded";
    health.redis = "disconnected";
  }

  // 🟠 RabbitMQ check
  try {
    const channel = getChannel();
    if (channel) {
      health.rabbitmq = "connected";
    } else {
      throw new Error("No channel");
    }
  } catch (err) {
    health.status = "degraded";
    health.rabbitmq = "disconnected";
  }

  return health;
}

/**
 * Circuit breaker state (Redis-backed)
 */
async function getCircuitState() {
  const raw = await redis.get("circuit:email");

  if (!raw) {
    return {
      circuit: "email",
      state: "CLOSED",
    };
  }

  const data = JSON.parse(raw);
  const now = Date.now();

  // 🔥 Derive HALF_OPEN dynamically
  if (
    data.state === "OPEN" &&
    now - data.lastFailureTime >= 15000
  ) {
    return {
      circuit: "email",
      state: "HALF_OPEN",
    };
  }

  return {
    circuit: "email",
    state: data.state,
  };
}


module.exports = {
  getHealthStatus,
  getCircuitState,
};
