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
module.exports = function makeReceivedAttachments(maxFileSizeBytes) {
  return function receivedAttachments(event) {
    console.log('Got event data', event.data.json);
    const eventData = event.data.json;
    if (!eventData || !eventData.attachments) {
      return;
    }

    const attachments = eventData.attachments;
    attachments.forEach((attachment) => {
      // attachment.size is in bytes
      if (attachment.size > maxFileSizeBytes) {
        console.log(`Attachment with name ${attachment.name} with ${attachment.size} is too long, skipping.`);
        return;
      }

      // TODO stricter allow list of image formats
      if (!attachment['content-type'].startsWith('image')) {
        console.log(`Attachment with name ${attachment.name} has invalid content-type ( ${attachment['content-type']}, skipping.`);
        return;
      }
    });
  };
};
