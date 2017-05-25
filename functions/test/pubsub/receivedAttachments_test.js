const _ = require('lodash');
const expect = require('expect')
const makeReceivedAttachments = require('../../lib/pubsub/receivedAttachments');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');
const attachments = JSON.parse(requestBody.attachments);

function makeEvent(json) {
  return {
    data: {
      attributes: {
        requestId: 'objectId',
      },
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
    return this.receivedAttachments(event);
  });

  it('exits when missing attachments data', function() {
    const event = makeEvent();
    return this.receivedAttachments(event);
  });

  it('skips attachments that are too large', function() {
    const event = makeEvent(_.extend({}, attachments, { size: 10000 }));
    return this.receivedAttachments(event);
  });

  it('skips attachments with non-image content types', function() {
    const event = makeEvent(_.extend({}, attachments, { 'content-type': 'application/pdf' }));
    return this.receivedAttachments(event);
  });
});

