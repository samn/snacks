var functions = require('firebase-functions');
var pubSub = require('@google-cloud/pubsub')();

const RECEIVED_ATTACHMENTS_TOPIC = 'received-attachments';

/* Attachments json:
[
  {
    "url": "https://sw.api.mailgun.net/v3/domains/sandboxcb622ce2e73141bfb55e3970ce6cb7fa.mailgun.org/messages/eyJwIjpmYWxzZSwiayI6IjVlNzk4ODM4LTBhZjktNDg4NS1hZDRjLTNlYzZhNTcwOWZlMyIsInMiOiI5NmJlODgzMjgxIiwiYyI6InRhbmtiIn0=/attachments/0",
    "content-type": "image/jpeg",
    "name": "IMG_8138.jpg",
    "size": 100243
  }
]
*/
exports.receiveEmail = functions.https.onRequest((request, response) => {
  console.log('request.body', Object.keys(request.body));
  console.log('attachments', request.body.attachments);
  const attachments = request.body.attachments;
  const pubSubMessage = {
    attachments,
  };
  pubSub.topic(RECEIVED_ATTACHMENTS_TOPIC).publish(pubSubMessage, (err) => {
    const status = err ? 500 : 200;
    response.status(status).end();
  });
});

exports.receivedAttachmentsPubSub = functions.pubsub.topic(RECEIVED_ATTACHMENTS_TOPIC).onPublish(event => {
  console.log('Got event data', event.data.json);
  const eventData = event.data.json;
});
