const expect = require('expect');
const nock = require('nock');
const Logger = require('../lib/Logger');

expect.extend({
  toBeCalledWith(...expectedArgs) {
    expect.assert(
      this.actual.calledWith(...expectedArgs),
      "expected %s to have been called with args %s",
      this.actual,
      ...expectedArgs
    );

    return this;
  },
});

beforeEach(function() {
  Logger.LOGGING_ENABLED = false;
});

afterEach(function () {
  expect(nock.isDone()).toBe(true);
  nock.cleanAll();
})
