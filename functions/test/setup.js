const expect = require('expect');
const nock = require('nock');

beforeEach(function() {
  nock.disableNetConnect();
});

afterEach(function () {
  expect(nock.isDone()).toBe(true);
  nock.cleanAll();
})
