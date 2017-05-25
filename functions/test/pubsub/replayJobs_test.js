const _ = require('lodash');
const expect = require('expect')
const makeReplayJobs = require('../../lib/pubsub/replayJobs');
const fakes = require('../fakes');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');

function makeEvent(requestIdsToReplay) {
  return {
    data: {
      attributes: {
        requestId: 'uuid',
      },
      json: {
        requestIdsToReplay
      },
    },
  };
}

describe('replayJobs', function() {
  beforeEach(function() {
    this.cloudStorageOptions = {
      path: '/requests/receiveEmail/uuid.json',
      data: [JSON.stringify(requestBody)],
      err: undefined,
    };
    const cloudStorage = fakes.cloudStorage(this.cloudStorageOptions);

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

    this.replayJobs = makeReplayJobs(cloudStorage, pubSub);
  });

  it('runs successfully', function() {
    const event = makeEvent(['uuid']);
    return this.replayJobs(event);
  });
});


