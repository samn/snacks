/* Attachments payload:
[
  {
    "url": "https://sw.api.mailgun.net/v3/domains/sandboxcb622ce2e73141bfb55e3970ce6cb7fa.mailgun.org/messages/eyJwIjpmYWxzZSwiayI6IjVlNzk4ODM4LTBhZjktNDg4NS1hZDRjLTNlYzZhNTcwOWZlMyIsInMiOiI5NmJlODgzMjgxIiwiYyI6InRhbmtiIn0=/attachments/0",
    "content-type": "image/jpeg",
    "name": "IMG_8138.jpg",
    "size": 100243
  }
]
*/
module.exports = function makeReceivedAttachments() {
  return function receivedAttachments(event) {
    console.log('Got event data', event.data.json);
    const eventData = event.data.json;
    if (!eventData || !eventData.attachments) {
      return;
    }

    const attachments = eventData.attachments;
  };
};
