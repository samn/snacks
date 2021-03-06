const _ = require('lodash');
const path = require('path');

const Logger = require('../Logger');
const paths = require('../paths');

const maxFileSizeBytes = 10 * 1000 * 1000; // 10 mb


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
exports.makeReceivedAttachments = function makeReceivedAttachments(mailgun, localFS, cloudStorage, postsEntity, imageManipulation, twitter) {
  return function receivedAttachments(message) {
    const submissionId = message.attributes.submissionId;
    const log = new Logger(submissionId);
    const eventData = message.json;

    if (!eventData || !eventData.attachments) {
      log.info('No attachments in event data, skipping message.', eventData);
      return;
    }

    return Promise.all(_.map(eventData.attachments, (attachment, idx) => {
      // attachment.size is in bytes
      if (attachment.size > maxFileSizeBytes) {
        log.error(`Attachment with name ${attachment.name} with ${attachment.size} is too long, skipping.`);
        return;
      }

      // content type is e.g. image/jpeg
      const contentType = attachment['content-type'];
      // Emails with images from iOS 11 have the content-type multipart/mixed
      if (!contentType.startsWith('image') && contentType !== 'multipart/mixed') {
        // TODO stricter allow list of image formats
        log.error(`Attachment with name ${attachment.name} has invalid content-type (${contentType}), skipping.`);
        return;
      }

      const extension = contentType.split('/')[1];
      const postId = `${submissionId}-${idx}`;
      const filename = `${postId}.${extension}`;
      const tempFilePath = paths.tempFilePath(filename);
      const originalCloudStoragePath = paths.originalPath(filename);
      const cloudStoragePath = paths.uploadPath(filename);
      // encoding should be null if binary data is expected
      return mailgun.get(attachment.url, { encoding: null })
        .then(saveLocallyTo(tempFilePath, localFS))
        .then(fixupImage(tempFilePath, imageManipulation))
        .then(uploadToCloudStorage(tempFilePath, originalCloudStoragePath, cloudStorageVisibility.private, cloudStorage))
        .then(compressImage(tempFilePath, imageManipulation))
        .then(uploadToCloudStorage(tempFilePath, cloudStoragePath, cloudStorageVisibility.public, cloudStorage))
        .then(lookupSize(tempFilePath, imageManipulation))
        .then(saveToDatastore(postId, cloudStoragePath, submissionId, postsEntity))
        .then(readImageData(tempFilePath, localFS))
        .then(tweetMedia(contentType, twitter))
        .catch(err => {
          log.error(err);
          throw err;
        });
    }));
  };
};

// Reprocess image files from GCS
// Event: {
//  pathsToReprocess: [
//    "",
//  ]
// }
exports.makeReprocessImages = function makeReprocessImages(localFS, cloudStorage, postsEntity, imageManipulation) {
  return function reprocessImages(message) {
    const pathsToReprocess = message.json.pathsToReprocess;
    return Promise.all(_.map(pathsToReprocess, (originalCloudStoragePath) => {
      const { base, name } = path.parse(originalCloudStoragePath);
      const postId = name;
      const submissionId = postId.split('-')[0];
      const tempFilePath = paths.tempFilePath(base);
      const cloudStoragePath = paths.uploadPath(base);

      const log = new Logger(submissionId);

      log.info("Reprocessing image from", originalCloudStoragePath);

      return cloudStorage.download(originalCloudStoragePath).then(data => data[0])
        .then(saveLocallyTo(tempFilePath, localFS))
        .then(compressImage(tempFilePath, imageManipulation))
        .then(uploadToCloudStorage(tempFilePath, cloudStoragePath, cloudStorageVisibility.public, cloudStorage))
        .then(lookupSize(tempFilePath, imageManipulation))
        .then(saveToDatastore(postId, cloudStoragePath, submissionId, postsEntity))
        .catch((err) => {
          log.error(err);
          throw err;
        });
    }));
  };
}

function saveLocallyTo(tempFilePath, localFS) {
  return function _saveLocallyTo(imageData) {
    return localFS.writeFile(tempFilePath, imageData);
  };
}

const cloudStorageVisibility = {
  public: 'public',
  private: 'private',
};
function uploadToCloudStorage(tempFilePath, cloudStoragePath, visibility, cloudStorage) {
  return function _uploadToCloudStorage() {
    const options = {
      destination: cloudStoragePath,
      resumable: false,
      public: visibility === cloudStorageVisibility.public,
      gzip: false,
    };

    if (visibility === cloudStorageVisibility.public) {
      options.metadata = {
        cacheControl: 'public, max-age=86400',
      };
    }

    return cloudStorage.upload(tempFilePath, options)
  };
}

// Returns the image dimensions
function lookupSize(tempFilePath, imageManipulation) {
  return function _lookupSize() {
    return imageManipulation.getSize(tempFilePath);
  }
}

function saveToDatastore(postId, cloudStoragePath, submissionId, postsEntity) {
  // sizeInfo should be the result of imageManipulation.getSize
  return function _saveToDatastore(sizeInfo) {
    return postsEntity.save(postId, cloudStoragePath, submissionId, sizeInfo);
  };
}

function fixupImage(tempFilePath, imageManipulation) {
  return function _fixupImage() {
    return imageManipulation.fixup(tempFilePath);
  }
}

function compressImage(tempFilePath, imageManipulation) {
  return function _compressImage() {
    return imageManipulation.compress(tempFilePath, 960);
  }
}

function readImageData(mediaPath, localFS) {
  return function _readImageData() {
    return localFS.readFile(mediaPath)
      .then((data) => {
        const imageData = {
          mediaData: data,
          mediaSize: data.length,
        };
        return imageData;
      })
    }
}

function tweetMedia(mediaType, twitter) {
  return function _tweetMedia(imageData) {
    if (twitter) {
      return twitter.tweetMedia(imageData.mediaSize, mediaType, imageData.mediaData);
    }
    return Promise.resolve();
  }
}

