const _ = require('lodash');
const expect = require('expect')
const Mailgun = require('../../lib/clients/mailgun');
const makeReceivedAttachments = require('../../lib/pubsub/receivedAttachments');
const fakes = require('../fakes');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');
const attachments = JSON.parse(requestBody.attachments);

function makeEvent(attachments) {
  return {
    data: {
      attributes: {
        requestId: 'objectId',
      },
      json: {
        attachments,
      },
    },
  };
}

describe('receivedAttachments', function() {
  beforeEach(function() {
    this.mailgun = fakes.mailgun();
    this.localFS = fakes.localFS();
    this.cloudStorage = fakes.cloudStorage();
    this.receivedAttachments = makeReceivedAttachments(2000, this.mailgun, this.localFS, this.cloudStorage);
  });

  it('runs successfully', function() {
    this.mailgun.get.resolves('image body')
    this.cloudStorage.upload.resolves();

    const event = makeEvent(attachments);
    return this.receivedAttachments(event)
      .then(() => {
        expect(this.localFS.writeFile).toBeCalledWith('/tmp/objectId-0.jpeg', 'image body');
        expect(this.cloudStorage.upload).toBeCalledWith(
          '/tmp/objectId-0.jpeg',
          {
            destination: '/images/objectId-0.jpeg',
            resumable: false,
            public: true,
            gzip: true,
          }
        );
      });
  });

  it('exits when missing attachments data', function() {
    const event = makeEvent();
    return this.receivedAttachments(event);
  });

  it('skips attachments that are too large', function() {
    const data = _.map(attachments, (attachment) => _.extend({}, attachment, { size: 10000 }));
    const event = makeEvent(data);
    return this.receivedAttachments(event);
  });

  it('skips attachments with non-image content types', function() {
    const data = _.map(attachments, (attachment) => _.extend({}, attachment, { 'content-type': 'application/pdf' }));
    const event = makeEvent(data);
    return this.receivedAttachments(event);
  });
});

