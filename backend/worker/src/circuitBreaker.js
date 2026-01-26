class CircuitBreaker {
  constructor({
    failureThreshold = 3,
    cooldownPeriod = 15000,
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownPeriod = cooldownPeriod;

    this.state = "CLOSED"; // CLOSED | OPEN | HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  canRequest() {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - this.lastFailureTime > this.cooldownPeriod) {
        this.state = "HALF_OPEN";
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  recordFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      console.log("🚨 Circuit opened");
    }
  }

  getState() {
    return this.state;
  }
}

module.exports = CircuitBreaker;
