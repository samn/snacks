const expect = require('expect')
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const makeReceiveEmail = require('../../lib/http/receiveEmail');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');

function makeFakePubSub(opts) {
  expect(opts).toExist();
  return {
    topic(topic) {
      expect(topic).toEqual(opts.topic);
      return {
        publish(event, cb) {
          expect(event).toEqual(opts.event);
          cb(opts.publishErr);
        },
      };
    },
  };
};

describe('receiveEmail', function() {
  beforeEach(function() {
    this.attachments = JSON.parse(requestBody.attachments);
    this.pubSubOptions = {
      topic: 'topic',
      event: {
        attachments: this.attachments,
      },
      publishErr: undefined,
    };
    this.pubSub = makeFakePubSub(this.pubSubOptions);

    this.app = express()
      .use(bodyParser.json())
      .post('/', makeReceiveEmail(this.pubSub, 'topic'));

    this.makeRequest = () => {
      return request(this.app)
        .post('/')
        .set('Content-Type', 'application/json')
        .send(requestBody);
    };
  });

  it('returns 200 on success', function() {
      this.makeRequest().expect(200);
  });

  it('returns 500 on publish failures', function() {
    this.pubSubOptions.publishErr = new Error();
    return request(this.app)
      this.makeRequest().expect(500);
  });
});
