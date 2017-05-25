const _ = require('lodash');
const Logger = require('../Logger');

// Re-enqueue messages by request id.
// Event: {
//  requestIdsToReplay: [
//    "",
//  ]
// }
module.exports = function makeReplayJobs(cloudStorage, pubSub) {
  return function replayJobs(event) {
    const requestIdsToReplay = event.data.json.requestIdsToReplay;
    return Promise.all(_.map(requestIdsToReplay, (requestId) => {
      const log = new Logger(requestId);
      // TODO consolidate how to generate this path
      log.info('Fetching message');
      return cloudStorage.download(`/requests/receiveEmail/${requestId}.json`)
        .then(data => {
          const requestBody = JSON.parse(data[0]);
          const attachments = JSON.parse(requestBody.attachments);
          const message = {
            data: {
              attachments,
            },
            attributes: {
              requestId,
            },
          };
          log.info('Enqueuing attachments');
          return pubSub.publish(message, { raw: true });
        })
        .catch((err) => {
          log.error(err);
        });
    }));
  };
}
