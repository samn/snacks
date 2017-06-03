const expect = require('expect')
const Mailgun = require('../../lib/clients/mailgun');
const nock = require('nock');

describe('Mailgun', function() {
  describe('#get', function() {
    it('requests with the api key', function() {
      const client = new Mailgun('api-key');

      nock('http://mailgun.net')
        .get('/blah')
        .reply(200);

      return client.get('http://mailgun.net/blah');
    });

    it('doesnt make requests to non-mailgun domains', function() {
      const client = new Mailgun('api-key');

      return client.get('http://test/blah')
        .then(() => { throw 'should be an error'})
        .catch((err) => expect(err).toEqual('Error: Only requests to mailgun.net are valid'));
    });
  });
});
