const _ = require('lodash');
const path = require('path');

const Logger = require('../Logger');

// Re-enqueue email messages by request json path (in cloud storage).
// Event: {
//  requestPathsToReplay: [
//    "",
//  ]
// }
module.exports = function makeReplayEmails(cloudStorage, pubSub) {
  return function replayEmails(message) {
    const requestPathsToReplay = message.json.requestPathsToReplay;
    return Promise.all(_.map(requestPathsToReplay, (requestPath) => {
      const submissionId = path.basename(requestPath, '.json');
      const log = new Logger(submissionId);

      log.info('Fetching message');
      return cloudStorage.download(requestPath)
        .then(data => {
          const requestBody = JSON.parse(data[0]);
          const message = {
            attachments: JSON.parse(requestBody.attachments),
          };
          const attributes = {
            submissionId,
          };
          log.info('Enqueuing attachments');
          return pubSub.publish(message, attributes);
        })
        .catch((err) => {
          log.error(err);
          throw err;
        });
    }));
  };
}
