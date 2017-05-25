const _ = require('lodash');
const expect = require('expect')
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const makeReceiveEmail = require('../../lib/http/receiveEmail');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');

function makeFakePubSub(opts) {
  expect(opts).toExist();
  return {
    publish(message, options) {
      expect(message).toEqual(opts.message);
      // TODO check options
      if (opts.err) {
        return Promise.reject(opts.err);
      } else {
        return Promise.resolve();
      }
    },
  };
}

function makeFakeCloudStorage(opts) {
  expect(opts).toExist();
  return {
    upload(path, options) {
      expect(path).toEqual(opts.path);
      expect(options).toEqual({
        destination: '/requests/receiveEmail/uuid.json',
        resumable: false,
      });
      if (opts.err) {
        return Promise.reject(opts.err);
      } else {
        return Promise.resolve();
      }
    },
  };
}

function makeFakeLocalFS(opts) {
  expect(opts).toExist();
  return {
    writeJSON(path, data) {
      expect(data).toEqual(opts.data);
      expect(path).toEqual(opts.path);
      if (opts.err) {
        return Promise.reject(opts.err);
      } else {
        return Promise.resolve();
      }
    },
  };
}

describe('receiveEmail', function() {
  beforeEach(function() {
    const attachments = JSON.parse(requestBody.attachments);
    this.pubSubOptions = {
      message: {
        attachments,
      },
      err: undefined,
    };
    const pubSub = makeFakePubSub(this.pubSubOptions);

    this.cloudStorageOptions = {
      path: '/tmp/uuid.json',
      err: undefined,
    };
    const cloudStorage = makeFakeCloudStorage(this.cloudStorageOptions);

    this.localFSOptions = {
      path: '/tmp/uuid.json',
      data: requestBody,
      err: undefined,
    };
    const localFS = makeFakeLocalFS(this.localFSOptions);

    const uuid = _.constant('uuid');

    const receieveEmail = makeReceiveEmail(pubSub, cloudStorage, localFS, uuid);
    const app = express()
      .use(bodyParser.json())
      .post('/', receieveEmail);

    this.makeRequest = function() {
      return request(app)
        .post('/')
        .set('Content-Type', 'application/json')
        .send(requestBody);
    };
  });

  it('returns 200 on success', function() {
    return this.makeRequest().expect(200);
  });

  it('returns 500 on localFS errors', function() {
    this.localFSOptions.err = new Error();
    return this.makeRequest().expect(500);
  });

  it('returns 500 on cloud storage failures', function() {
    this.cloudStorageOptions.err = new Error();
    return this.makeRequest().expect(500);
  });

  it('returns 500 on publish failures', function() {
    this.pubSubOptions.err = new Error();
    return this.makeRequest().expect(500);
  });
});
