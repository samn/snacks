const expect = require('expect')
const Mailgun = require('../../lib/clients/Mailgun');
const nock = require('nock');

describe('Mailgun', function() {
  describe('#get', function() {
    it('requests with the api key', function() {
      const client = new Mailgun('api-key');

      nock('http://test')
        .get('/blah')
        .reply(200);

      return client.get('http://test/blah');
    });
  });
});
