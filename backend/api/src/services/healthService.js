const redis = require("../redis");
const { getChannel } = require("../rabbitmq");

async function getHealthStatus() {
  const health = {
    status: "ok",
    redis: "unknown",
    rabbitmq: "unknown",
    timestamp: Date.now()
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


async function getCircuitState() {
  const state = await redis.get("circuit:email");
  return {
    circuit: "email",
    state: state || "UNKNOWN"
  };
}

module.exports = {
  getHealthStatus,
  getCircuitState
};


