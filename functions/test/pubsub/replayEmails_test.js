const _ = require('lodash');
const expect = require('expect')
const makeReplayEmails = require('../../lib/pubsub/replayEmails');
const fakes = require('../fakes');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');

function makeEvent(requestPathsToReplay) {
  return {
    data: {
      attributes: {
        submissionId: 'objectId',
      },
      json: {
       requestPathsToReplay,
      },
    },
  };
}

describe('replayEmails', function() {
  beforeEach(function() {
    this.cloudStorage = fakes.cloudStorage();
    this.pubSub = fakes.pubSub();

    this.replayEmails = makeReplayEmails(this.cloudStorage, this.pubSub);
  });

  it('runs successfully', function() {
    this.cloudStorage.download.resolves([JSON.stringify(requestBody)]);
    const event = makeEvent(['/requests/receiveEmail/objectId.json']);
    return this.replayEmails(event)
      .then(() => {
        expect(this.cloudStorage.download).toBeCalledWith('/requests/receiveEmail/objectId.json')

        const pubSubMessage = {
          data: {
            attachments: JSON.parse(requestBody.attachments),
          },
          attributes: {
            submissionId: 'objectId',
          },
        };
        expect(this.pubSub.publish).toBeCalledWith(pubSubMessage, { raw: true, timeout: 300000 });
      });;
  });
});


