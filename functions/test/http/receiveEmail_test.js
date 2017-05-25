const _ = require('lodash');
const expect = require('expect')
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const makeReceiveEmail = require('../../lib/http/receiveEmail');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');
const fakes = require('../fakes');

describe('receiveEmail', function() {
  beforeEach(function() {
    const attachments = JSON.parse(requestBody.attachments);
    this.pubSubOptions = {
      message: {
        data: {
          attachments,
        },
        attributes: {
          requestId: 'uuid',
        },
      },
      err: undefined,
    };
    const pubSub = fakes.pubSub(this.pubSubOptions);

    this.cloudStorageOptions = {
      path: '/tmp/uuid.json',
      options: {
        destination: '/requests/receiveEmail/uuid.json',
        resumable: false,
      },
      err: undefined,
    };
    const cloudStorage = fakes.cloudStorage(this.cloudStorageOptions);

    this.localFSOptions = {
      path: '/tmp/uuid.json',
      data: requestBody,
      err: undefined,
    };
    const localFS = fakes.localFS(this.localFSOptions);

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
