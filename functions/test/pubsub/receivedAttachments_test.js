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
    this.receivedAttachments = makeReceivedAttachments();
  });

  it('runs successfully', function() {
    const event = makeEvent(attachments);
    this.receivedAttachments(event);
  });

  it('exits when missing attachments data', function() {
    const event = makeEvent();
    this.receivedAttachments(event);
  });
});

