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
    this.pubSub = fakes.pubSub();
    this.cloudStorage = fakes.cloudStorage();
    this.localFS = fakes.localFS();

    const uuid = _.constant('uuid');

    const receieveEmail = makeReceiveEmail(this.pubSub, this.cloudStorage, this.localFS, uuid);
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
    this.localFS.writeJSON.resolves();
    this.pubSub.publish.resolves();
    this.cloudStorage.upload.resolves();
    return this.makeRequest().expect(200)
      .then(() => {
        expect(this.localFS.writeJSON).toBeCalledWith(
          '/tmp/uuid.json',
          requestBody
        );

        expect(this.cloudStorage.upload).toBeCalledWith(
          '/tmp/uuid.json',
          {
            destination: '/requests/receiveEmail/uuid.json',
            resumable: false,
          }
        );

        const pubSubMessage = {
          data: {
            attachments: JSON.parse(requestBody.attachments),
          },
          attributes: {
            requestId: 'uuid',
          },
        };
        expect(this.pubSub.publish).toBeCalledWith(pubSubMessage, { raw: true });
      });
  });

  it('returns 500 on localFS errors', function() {
    this.localFS.writeJSON.rejects();
    return this.makeRequest().expect(500);
  });

  it('returns 500 on cloud storage failures', function() {
    this.localFS.writeJSON.resolves();
    this.cloudStorage.upload.rejects();
    return this.makeRequest().expect(500);
  });

  it('returns 500 on publish failures', function() {
    this.localFS.writeJSON.resolves();
    this.cloudStorage.upload.resolves();
    this.pubSub.publish.rejects()
    return this.makeRequest().expect(500);
  });
});
