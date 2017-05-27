const functions = require('firebase-functions');
const gPubSub = require('@google-cloud/pubsub')();
const gcs = require('@google-cloud/storage')();
const cloudDatastore = require('@google-cloud/datastore')();
const fs = require('fs-extra');
const ObjectID = require('bson-objectid');

const topics = require('./lib/pubsub/topics');
const makeReceiveEmail = require('./lib/http/receiveEmail');
const makeRenderIndex = require('./lib/http/renderIndex');
const makeReceivedAttachments = require('./lib/pubsub/receivedAttachments');
const makeReplayJobs = require('./lib/pubsub/replayJobs');
const PostsEntity = require('./lib/entities/posts');
const Mailgun = require('./lib/clients/mailgun');

// wrapper interface for easier testing
function makePubSub(topic) {
  return {
    publish(message, options) {
      return gPubSub.topic(topic).publish(message, options);
    },
  };
}

// wrapper interface for easier testing
function makeCloudStorage(bucket) {
  return {
    upload(path, options) {
      return gcs.bucket(bucket).upload(path, options);
    },
    download(path) {
      return gcs.bucket(bucket).file(path).download();
    },
  };
}

// wrapper interface for easier testing
const localFS = {
  writeJSON(path, data) {
    return fs.writeJSON(path, data);
  },
  writeFile(path, data) {
    return fs.writeFile(path, data);
  }
}

const datastore = {
  key(kind) {
    return cloudDatastore.key(kind);
  },
  save(entity) {
    return cloudDatastore.save(entity);
  },
}

const receivedAttachmentsPubSub = makePubSub(topics.receivedAttachments);
const incomingMessagesCloudStorage = makeCloudStorage(functions.config().incomingmessages.bucket);

const contentCloudStorage = makeCloudStorage(functions.config().content.bucket);

const receiveEmail = makeReceiveEmail(receivedAttachmentsPubSub, incomingMessagesCloudStorage, localFS, ObjectID);
exports.receiveEmail = functions.https.onRequest(receiveEmail);

const maxFileSizeBytes = 10 * 1000 * 1000; // 10 mb
const mailgun = new Mailgun(functions.config().mailgun.apikey);
const receivedAttachments = makeReceivedAttachments(maxFileSizeBytes, mailgun, localFS, contentCloudStorage, datastore);
exports.receivedAttachmentsPubSub = functions.pubsub.topic(topics.receivedAttachments).onPublish(receivedAttachments);

const replayJobs = makeReplayJobs(incomingMessagesCloudStorage, receivedAttachmentsPubSub);
exports.replayJobsPubSub = functions.pubsub.topic(topics.replayJobs ).onPublish(replayJobs);

const postsEntity = new PostsEntity(cloudDatastore);
const renderIndex = makeRenderIndex(ObjectID, functions.config().content.baseurl, postsEntity);
exports.renderIndex = functions.https.onRequest(renderIndex);
