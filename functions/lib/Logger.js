function format(requestId, message) {
  return `[${requestId}] ${message}`;
}

class Logger {
  constructor(requestId) {
    this.requestId = requestId;
  }

  info(message) {
    if (Logger.LOGGING_ENABLED) {
      console.info(format(this.requestId, message));
    }
  }

  error(message) {
    if (Logger.LOGGING_ENABLED) {
      console.error(format(this.requestId, message));
    }
  }
}
Logger.LOGGING_ENABLED = true;

module.exports = Logger;
