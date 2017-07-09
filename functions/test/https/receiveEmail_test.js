const _ = require('lodash');
const expect = require('expect')
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const makeReceiveEmail = require('../../lib/https/receiveEmail');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');
const fakes = require('../fakes');

describe('receiveEmail', function() {
  beforeEach(function() {
    this.pubSub = fakes.pubSub();
    this.cloudStorage = fakes.cloudStorage();
    this.localFS = fakes.localFS();

    const objectId = {
      generate: _.constant('objectId'),
    };

    const receiveEmail = makeReceiveEmail(this.pubSub, this.cloudStorage, this.localFS, objectId);
    const app = express()
      .use(bodyParser.json())
      .post('/', receiveEmail);

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
          '/tmp/objectId.json',
          requestBody
        );

        expect(this.cloudStorage.upload).toBeCalledWith(
          '/tmp/objectId.json',
          {
            destination: '/requests/receiveEmail/objectId.json',
            resumable: false,
          }
        );

        const pubSubMessage = {
          data: {
            attachments: JSON.parse(requestBody.attachments),
          },
          attributes: {
            submissionId: 'objectId',
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
