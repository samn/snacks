const expect = require('expect');
const nock = require('nock');
const Logger = require('../lib/Logger');

beforeEach(function() {
  Logger.LOGGING_ENABLED = false;
});

afterEach(function () {
  expect(nock.isDone()).toBe(true);
  nock.cleanAll();
})
