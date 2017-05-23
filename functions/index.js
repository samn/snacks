const functions = require('firebase-functions');
const pubSub = require('@google-cloud/pubsub')();

const topics = require('./lib/pubsub/topics');
const makeReceiveEmail = require('./lib/http/receiveEmail');
const makeReceivedAttachments = require('./lib/pubsub/receivedAttachments');

exports.receiveEmail = functions.https.onRequest(makeReceiveEmail(pubSub, topics.receivedAttachments));

const maxFileSizeBytes = 10 * 1000 * 1000; // 10 mb
exports.receivedAttachmentsPubSub = functions.pubsub.topic(topics.receivedAttachments).onPublish(makeReceivedAttachments(maxFileSizeBytes));
