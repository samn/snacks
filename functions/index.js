const functions = require('firebase-functions');
const pubSub = require('@google-cloud/pubsub')();

const topics = require('./lib/topics');
const makeReceiveEmail = require('./lib/http/receiveEmail');
const makeReceivedAttachments = require('./lib/pubsub/receivedAttachments');

exports.receiveEmail = functions.https.onRequest(makeReceiveEmail(pubSub, topics.receivedAttachments));

exports.receivedAttachmentsPubSub = functions.pubsub.topic(topics.receivedAttachments).onPublish(makeReceivedAttachments());
