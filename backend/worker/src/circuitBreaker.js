const redis = require("./redis");

class CircuitBreaker {
  constructor({
    failureThreshold = 3,
    cooldownPeriod = 15000,
    redisKey = "circuit:email",
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownPeriod = cooldownPeriod;
    this.redisKey = redisKey;

    this.state = "CLOSED"; // CLOSED | OPEN | HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;

    //  persist initial state
    this.persistState();
  }

  async persistState() {
    try {
      await redis.set(this.redisKey, this.state);
    } catch (err) {
      console.error("Failed to persist circuit breaker state", err);
    }
  }


  canRequest() {
    if (this.state === "OPEN") {
      const now = Date.now();

      if (now - this.lastFailureTime > this.cooldownPeriod) {
        this.state = "HALF_OPEN";
        this.persistState(); 
        return true;
      }

      return false;
    }
    return true;
  }

recordSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
    this.persistState(); 
  }

  recordFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      if (this.state !== "OPEN") {
        console.log("🚨 Circuit opened");
      }
      this.state = "OPEN";
      this.persistState(); 
    }
  }

  getState() {
    return this.state;
  }
}

module.exports = CircuitBreaker;
