function header(requestId) {
  return `[${requestId}]`;
}

class Logger {
  constructor(requestId) {
    this.requestId = requestId;
  }

  info(...message) {
    if (Logger.LOGGING_ENABLED) {
      console.info(header(this.requestId), ...message);
    }
  }

  error(...message) {
    if (Logger.LOGGING_ENABLED) {
      console.error(header(this.requestId), ...message);
    }
  }
}
Logger.LOGGING_ENABLED = true;

module.exports = Logger;
