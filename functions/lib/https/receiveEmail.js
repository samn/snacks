const Logger = require('../Logger');
const paths = require('../paths');
const render = require('./render');

module.exports = function makeReceiveEmail(pubSub, cloudStorage, localFS, objectId) {
  return function receiveEmail(request, response) {
    const submissionId = objectId.generate();
    const log = new Logger(submissionId);

    // attachments is a JSON encoded string, see test/fixtures/requests/receiveEmail/body.json
    const attachments = JSON.parse(request.body.attachments);
    const pubSubMessage = {
      data: {
        attachments,
      },
      attributes: {
        submissionId,
      },
    };

    const filename = `${submissionId}.json`;
    const tempFilePath = paths.tempFilePath(filename);
    localFS.writeJSON(tempFilePath, request.body)
      .then(uploadToCloudStorage(cloudStorage, tempFilePath, filename))
      .then(publishMessage(pubSub, pubSubMessage))
      .then(render.success(response))
      .catch(render.failure(log, response));
  };
};

function uploadToCloudStorage(cloudStorage, tempFilePath, filename) {
  return function() {
    const options = {
      destination: paths.requestPath(filename),
      resumable: false,
    };
    return cloudStorage.upload(tempFilePath, options);
  }
}

function publishMessage(pubSub, message) {
  return function() {
    return pubSub.publish(message, {
      raw: true,
      timeout: 5 * 60 * 1000, // ms
    });
  }
}
