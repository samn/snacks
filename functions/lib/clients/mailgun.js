const rp = require('request-promise');

class Mailgun {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  get(uri) {
    const options = {
      uri,
      auth: {
        user: 'api',
        pass: this.apiKey,
      },
      timeout: 600000, // milliseconds
    };
    return rp(options);
  }
}

module.exports = Mailgun;
