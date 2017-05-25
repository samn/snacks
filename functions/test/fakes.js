const expect = require('expect')
const sinon = require('sinon');

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
  });
}

