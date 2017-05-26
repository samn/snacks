const _ = require('lodash');
const rp = require('request-promise');

class Mailgun {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  get(uri, opts) {
    const options = _.merge({
      method: 'GET',
      uri,
      auth: {
        user: 'api',
        pass: this.apiKey,
      },
      timeout: 600000, // milliseconds
    }, opts);
    return rp(options);
  }
}

module.exports = Mailgun;
