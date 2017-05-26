const _ = require('lodash');
const Logger = require('../Logger');

// Re-enqueue messages by request id.
// Event: {
//  submissionIdsToReplay: [
//    "",
//  ]
// }
module.exports = function makeReplayJobs(cloudStorage, pubSub) {
  return function replayJobs(event) {
    const submissionIdsToReplay = event.data.json.submissionIdsToReplay;
    return Promise.all(_.map(submissionIdsToReplay, (submissionId) => {
      const log = new Logger(submissionId);
      // TODO consolidate how to generate this path
      log.info('Fetching message');
      return cloudStorage.download(`/requests/receiveEmail/${submissionId}.json`)
        .then(data => {
          const requestBody = JSON.parse(data[0]);
          const attachments = JSON.parse(requestBody.attachments);
          const message = {
            data: {
              attachments,
            },
            attributes: {
              submissionId,
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
