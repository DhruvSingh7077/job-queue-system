const redis = require("./redis");

class CircuitBreaker {
  constructor({
    failureThreshold = 3,
    cooldownPeriod = 10000,
    redisKey = "circuit:email",
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownPeriod = cooldownPeriod;
    this.redisKey = redisKey;
  }

  /**
   * Load full circuit state from Redis
   */
  async _load() {
    const data = await redis.get(this.redisKey);
    if (!data) {
      return {
        state: "CLOSED",
        failureCount: 0,
        lastFailureTime: 0,
      };
    }
    return JSON.parse(data);
  }

  /**
   * Persist full circuit state
   */
  async _save(state) {
    await redis.set(this.redisKey, JSON.stringify(state));
  }

  /**
   * Can a request pass?
   */
  async canRequest() {
    const now = Date.now();
    const circuit = await this._load();

    if (circuit.state === "OPEN") {
      if (now - circuit.lastFailureTime >= this.cooldownPeriod) {
        // Move to HALF_OPEN
        circuit.state = "HALF_OPEN";
        circuit.halfOpenInProgress = false;
        await this._save(circuit);
        return this.canRequest();
      }
      return false;
    }

    if (circuit.state === "HALF_OPEN") {
      if (circuit.halfOpenInProgress) {
        return false;
      }

      // 🔒 Distributed lock for probe request
      circuit.halfOpenInProgress = true;
      await this._save(circuit);
      return true;
    }

    return true; // CLOSED
  }

  /**
   * Record success
   */
  async recordSuccess() {
    const circuit = await this._load();

    circuit.state = "CLOSED";
    circuit.failureCount = 0;
    circuit.lastFailureTime = 0;
    circuit.halfOpenInProgress = false;

    await this._save(circuit);
  }

  /**
   * Record failure
   */
  async recordFailure() {
    const circuit = await this._load();

    circuit.failureCount += 1;
    circuit.lastFailureTime = Date.now();

    if (
      circuit.state === "HALF_OPEN" ||
      circuit.failureCount >= this.failureThreshold
    ) {
      circuit.state = "OPEN";
    }

    circuit.halfOpenInProgress = false;
    await this._save(circuit);

    console.log("🚨 Circuit state:", circuit.state);
  }

  /**
   * Get current circuit state
   */
  async getState() {
    const circuit = await this._load();
    return circuit.state;
  }
}

module.exports = CircuitBreaker;
