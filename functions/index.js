const functions = require('firebase-functions');
const gPubSub = require('@google-cloud/pubsub')();
const gcs = require('@google-cloud/storage')();
const fs = require('fs-extra');
const uuid = require('uuid');

const topics = require('./lib/pubsub/topics');
const makeReceiveEmail = require('./lib/http/receiveEmail');
const makeReceivedAttachments = require('./lib/pubsub/receivedAttachments');

// wrapper for easier testing
function makePubSub(topic) {
  return {
    publish(message, options) {
      return gPubSub.topic(topic).publish(message, options);
    },
  };
}

// wrapper for easier testing
function makeCloudStorage(bucket) {
  return {
    upload(path, options) {
      return gcs.bucket(bucket).upload(path, options);
    },
  };
}

// wrapper for easier testing
const localFS = {
  writeJSON(path, data) {
    return fs.writeJSON(path, data);
  }
}

const receiveEmailPubSub = makePubSub(topics.receivedAttachments);
const receiveEmailCloudStorage = makeCloudStorage(functions.config().incomingmessages.bucket);
const receiveEmail = makeReceiveEmail(receiveEmailPubSub, receiveEmailCloudStorage, localFS, uuid);
exports.receiveEmail = functions.https.onRequest(receiveEmail);

const maxFileSizeBytes = 10 * 1000 * 1000; // 10 mb
exports.receivedAttachmentsPubSub = functions.pubsub.topic(topics.receivedAttachments).onPublish(makeReceivedAttachments(maxFileSizeBytes));
