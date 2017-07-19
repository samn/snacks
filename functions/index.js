const functions = require('firebase-functions');
const next = require('next')
const gPubSub = require('@google-cloud/pubsub')();
const gcs = require('@google-cloud/storage')();
const cloudDatastore = require('@google-cloud/datastore')();
const fs = require('fs-extra');
const ObjectID = require('bson-objectid');
const gm = require('gm').subClass({ imageMagick: true });

const topics = require('./lib/pubsub/topics');
const makeReceiveEmail = require('./lib/https/receiveEmail');
const makeRenderApp = require('./lib/https/renderApp');
const makeFetchPosts = require('./lib/https/fetchPosts');
const makeMainApp = require('./lib/https/mainApp');
const { makeReceivedAttachments, makeReprocessImages } = require('./lib/pubsub/processUploads');
const makeReplayEmails = require('./lib/pubsub/replayEmails');
const PostsEntity = require('./lib/entities/posts');
const Mailgun = require('./lib/clients/mailgun');
const { makeTwitterClient, uploadTwitterMedia, sendTweet } = require('./lib/clients/twitterClient')

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
function makeTwitter(client) {
  return {
    upload(mediaSize, mediaType, mediaData) {
      return uploadTwitterMedia(client, mediaSize, mediaType, mediaData);
    },
    tweet(mediaId) {
      return sendTweet(client, mediaId);
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
  },
  readFile(path) {
    return fs.readFile(path);
  },
  stat(path) {
    return fs.stat(path);
  }
}

// wrapper interface for easier testing
const datastore = {
  key(kind) {
    return cloudDatastore.key(kind);
  },
  save(entity) {
    return cloudDatastore.save(entity);
  },
}


// wrapper interface for easier testing
const imageManipulation = {
  // auto orient and remove EXIF
  fixup(path) {
    return new Promise((resolve, reject) => {
      gm(path)
        .autoOrient()
        .noProfile()
        .write(path, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
  },
  getSize(path) {
    return new Promise((resolve, reject) => {
      gm(path).size((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },
  compress(path, maxWidth) {
    // In testing gifs got messed up when compressed with the settings below.
    // For now they're not processed further since they're not posted that often.
    if (path.endsWith('.gif')) {
      return Promise.resolve();
    }

    return this.getSize(path)
      .then((sizeInfo) => {
        return new Promise((resolve, reject) => {
          const width = sizeInfo.width > maxWidth ? maxWidth : sizeInfo.width;
          gm(path)
            .resize(width)
            .quality(85)
            .unsharp(0.25, 0.25, 8, 0.065)
            .filter('Triangle')
            .define('jpeg:fancy-upsampling=off')
            .define('filter:support=2')
            .define('png:compression-filter=5')
            .define('png:compression-level=9')
            .define('png:compression-strategy=1')
            .define('png:exclude-chunk=all')
            .interlace('none')
            .colorspace('sRGB')
            .alpha('remove')
            .strip()
            .write(path, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
      });
  },
}

const receivedAttachmentsPubSub = makePubSub(topics.receivedAttachments);
const incomingMessagesCloudStorage = makeCloudStorage(functions.config().incomingmessages.bucket);

const contentCloudStorage = makeCloudStorage(functions.config().content.bucket);
const postsEntity = new PostsEntity(cloudDatastore, functions.config().content.baseurl);
const mailgun = new Mailgun(functions.config().mailgun.apikey);

const twitterClient = makeTwitterClient(functions.config().twitter.consumerkey, functions.config().twitter.consumersecret, functions.config().twitter.accesstokenkey, functions.config().twitter.accesstokensecret);
const twitter = makeTwitter(twitterClient);

const receiveEmail = makeReceiveEmail(receivedAttachmentsPubSub, incomingMessagesCloudStorage, localFS, ObjectID);
exports.receiveEmail = functions.https.onRequest(receiveEmail);

const receivedAttachments = makeReceivedAttachments(mailgun, localFS, contentCloudStorage, postsEntity, imageManipulation, twitter);
exports.receivedAttachmentsPubSub = functions.pubsub.topic(topics.receivedAttachments).onPublish(receivedAttachments);

const reprocessImages = makeReprocessImages(localFS, contentCloudStorage, postsEntity, imageManipulation);
exports.reprocessImagesPubSub = functions.pubsub.topic(topics.reprocessImages).onPublish(reprocessImages);

const replayEmails = makeReplayEmails(incomingMessagesCloudStorage, receivedAttachmentsPubSub);
exports.replayEmailsPubSub = functions.pubsub.topic(topics.replayEmails ).onPublish(replayEmails);

const nextApp = next({ dev: false }).getRequestHandler();
const renderApp = makeRenderApp(nextApp, postsEntity);
const fetchPosts = makeFetchPosts(postsEntity);
const mainApp = makeMainApp(renderApp, fetchPosts);
exports.mainApp = functions.https.onRequest(mainApp);
