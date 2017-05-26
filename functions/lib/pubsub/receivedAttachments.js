const _ = require('lodash');
const Logger = require('../Logger');

/* Attachments payload:
[
  {
    "url": "https://mailgun/attachment/0",
    "content-type": "image/jpeg",
    "name": "IMG_8138.jpg",
    "size": 100243
  }
]
*/
module.exports = function makeReceivedAttachments(maxFileSizeBytes, mailgun, localFS, cloudStorage) {
  return function receivedAttachments(event) {
    const requestId = event.data.attributes.requestId;
    const log = new Logger(requestId);
    const eventData = event.data.json;

    log.info('Got event data', eventData);
    if (!eventData || !eventData.attachments) {
      return;
    }

    // reverse attachments so they're posted in reverse chronological order
    const attachments = _.reverse(eventData.attachments);
    return Promise.all(_.map(attachments, (attachment, idx) => {
      // attachment.size is in bytes
      if (attachment.size > maxFileSizeBytes) {
        log.error(`Attachment with name ${attachment.name} with ${attachment.size} is too long, skipping.`);
        return;
      }

      // TODO stricter allow list of image formats
      if (!attachment['content-type'].startsWith('image')) {
        log.error(`Attachment with name ${attachment.name} has invalid content-type ( ${attachment['content-type']}, skipping.`);
        return;
      }

      // content type is e.g. image/jpeg
      const extension = attachment['content-type'].split('/')[1];
      const filename = `${requestId}-${idx}.${extension}`;
      const tempFile = `/tmp/${filename}`;
      // encoding should be null if binary data is expected
      return mailgun.get(attachment.url, { encoding: null })
        .then(imageBody => {
          log.info('Got image body', imageBody);
          log.info(tempFile)
          return localFS.writeFile(tempFile, imageBody);
        })
        .then(() => {
          const options = {
            destination: `/images/${filename}`,
            resumable: false,
            public: true,
            gzip: true,
          };
          return cloudStorage.upload(tempFile, options)
            .then((r) => {
              log.info('Cloud storage upload complete', r);
            });
        })
        .catch((err) => {
          log.error(err);
        });
    }));
  };
};
