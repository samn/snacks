const expect = require('expect')
const sinon = require('sinon');
const Mailgun = require('../lib/clients/mailgun');

exports.pubSub = function makeFakePubSub() {
  return sinon.stub({
    publish(message, options) { }
  });
}

exports.cloudStorage = function makeFakeCloudStorage() {
  return sinon.stub({
    upload(path, options) { },
    download(path) { }
  });
}

exports.localFS = function makeFakeLocalFS() {
  return sinon.stub({
    writeJSON(path, data) { },
    writeFile(path, data) { },
    readFile(path) { },
  });
}

exports.mailgun = function makeFakeMailgun() {
  return sinon.stub(new Mailgun());
}

exports.datastore = function makeFakeDatastore() {
  return sinon.stub({
    key(kind) { },
    save(entity) { },
    createQuery() { },
    runQuery() { },
  });
}

exports.imageManipulation = function makeFakeImageManipulation() {
  return sinon.stub({
    fixup() { },
    getSize() { },
    compress() { },
  });
}

exports.twitter = function makeFakeTwitter() {
  return sinon.stub({
    tweetMedia(mediaSize, mediaType, mediaData) { },
  });
}
