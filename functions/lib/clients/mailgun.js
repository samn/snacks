const _ = require('lodash');
const rp = require('request-promise');
const url = require('url');

class Mailgun {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  get(uri, opts) {
    if (!url.parse(uri).host.endsWith('mailgun.net')) {
      return Promise.reject(new Error('Only requests to mailgun.net are valid'));
    }

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
