const expect = require('expect');
const nock = require('nock');

afterEach(function () {
  expect(nock.isDone()).toBe(true);
  nock.cleanAll();
})
