module.exports = function makeReceiveEmail(pubSub, topic) {
  return function receiveEmail(request, response) {
    // attachments is a JSON encoded string, see test/fixtures/requests/receiveEmail/body.json
    const attachments = JSON.parse(request.body.attachments);
    const pubSubMessage = {
      attachments,
    };
    pubSub.topic(topic).publish(pubSubMessage, (err) => {
      const status = err ? 500 : 200;
      response.status(status).end();
    });
  };
};
