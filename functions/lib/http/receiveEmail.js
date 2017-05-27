const Logger = require('../Logger');
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
    const tmpPath = `/tmp/${filename}`;
    localFS.writeJSON(tmpPath, request.body)
      .then(uploadToCloudStorage(cloudStorage, tmpPath, filename))
      .then(publishMessage(pubSub, pubSubMessage))
      .then(render.success(response))
      .catch(render.failure(log, response));
  };
};

function uploadToCloudStorage(cloudStorage, tmpPath, filename) {
  return function() {
    const options = {
      destination: `/requests/receiveEmail/${filename}`,
      resumable: false,
    };
    return cloudStorage.upload(tmpPath, options);
  }
}

function publishMessage(pubSub, message) {
  return function() {
    return pubSub.publish(message, { raw: true });
  }
}
