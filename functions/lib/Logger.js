function header(submissionId) {
  return `[${submissionId}]`;
}

class Logger {
  constructor(submissionId) {
    this.submissionId = submissionId;
  }

  info(...message) {
    if (Logger.LOGGING_ENABLED) {
      console.info(header(this.submissionId), ...message);
    }
  }

  error(...message) {
    if (Logger.LOGGING_ENABLED) {
      console.error(header(this.submissionId), ...message);
    }
  }
}
Logger.LOGGING_ENABLED = true;

module.exports = Logger;
