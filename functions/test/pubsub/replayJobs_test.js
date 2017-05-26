const _ = require('lodash');
const expect = require('expect')
const makeReplayJobs = require('../../lib/pubsub/replayJobs');
const fakes = require('../fakes');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');

function makeEvent(submissionIdsToReplay) {
  return {
    data: {
      attributes: {
        submissionId: 'objectId',
      },
      json: {
        submissionIdsToReplay
      },
    },
  };
}

describe('replayJobs', function() {
  beforeEach(function() {
    this.cloudStorage = fakes.cloudStorage();
    this.pubSub = fakes.pubSub();

    this.replayJobs = makeReplayJobs(this.cloudStorage, this.pubSub);
  });

  it('runs successfully', function() {
    this.cloudStorage.download.resolves([JSON.stringify(requestBody)]);
    const event = makeEvent(['objectId']);
    return this.replayJobs(event)
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
        expect(this.pubSub.publish).toBeCalledWith(pubSubMessage, { raw: true });
      });;
  });
});


