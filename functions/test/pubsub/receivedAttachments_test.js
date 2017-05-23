const _ = require('lodash');
const expect = require('expect')
const makeReceivedAttachments = require('../../lib/pubsub/receivedAttachments');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');
const attachments = JSON.parse(requestBody.attachments);

function makeEvent(json) {
  return {
    data: {
      json,
    },
  };
}

describe('receivedAttachments', function() {
  beforeEach(function() {
    this.receivedAttachments = makeReceivedAttachments(2000);
  });

  it('runs successfully', function() {
    const event = makeEvent(attachments);
    this.receivedAttachments(event);
  });

  it('exits when missing attachments data', function() {
    const event = makeEvent();
    this.receivedAttachments(event);
  });

  it('skips attachments that are too large', function() {
    const event = makeEvent(_.extend({}, attachments, { size: 10000 }));
    this.receivedAttachments(event);
  });

  it('skips attachments with non-image content types', function() {
    const event = makeEvent(_.extend({}, attachments, { 'content-type': 'application/pdf' }));
    this.receivedAttachments(event);
  });
});

