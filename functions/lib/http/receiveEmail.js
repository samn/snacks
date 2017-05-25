module.exports = function makeReceiveEmail(pubSub, cloudStorage, localFS, uuid) {
  return function receiveEmail(request, response) {
    const requestId = uuid();

    // attachments is a JSON encoded string, see test/fixtures/requests/receiveEmail/body.json
    const attachments = JSON.parse(request.body.attachments);
    const pubSubMessage = {
      attachments,
    };

    const filename = `${requestId}.json`;
    const tmpPath = `/tmp/${filename}`;
    localFS.writeJSON(tmpPath, request.body)
      .then(uploadToCloudStorage(cloudStorage, tmpPath, filename))
      .then(publishMessage(pubSub, pubSubMessage))
      .then(success(response))
      .catch(failure(response));
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
    return pubSub.publish(message);
  }
}

function success(response) {
  return function() {
    response.status(200).end();
  };
}

function failure(response) {
  return function(err) {
    console.error(err);
    response.status(500).end();
  };
}
