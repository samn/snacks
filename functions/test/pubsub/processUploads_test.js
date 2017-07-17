const _ = require('lodash');
const expect = require('expect')
const sinon = require('sinon');
const { makeReceivedAttachments, makeReprocessImages } = require('../../lib/pubsub/processUploads');
const fakes = require('../fakes');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');
const attachments = JSON.parse(requestBody.attachments);
const PostsEntity = require('../../lib/entities/posts');

function makeEvent(attachments) {
  return {
    data: {
      attributes: {
        submissionId: 'objectId',
      },
      json: {
        attachments,
      },
    },
  };
}

describe('receivedAttachments', function() {
  beforeEach(function() {
    this.mailgun = fakes.mailgun();
    this.twitter = fakes.twitter();
    this.localFS = fakes.localFS();
    this.cloudStorage = fakes.cloudStorage();
    this.postsEntity = sinon.stub(new PostsEntity());
    this.imageManipulation = fakes.imageManipulation();
    this.receivedAttachments = makeReceivedAttachments(this.mailgun, this.localFS, this.cloudStorage, this.postsEntity, this.imageManipulation, this.twitter);
  });

  it('runs successfully', function() {
    this.mailgun.get.resolves('image data')
    this.imageManipulation.getSize.resolves({
      height: 10,
      width: 100,
    });
    this.cloudStorage.upload.resolves();
    this.postsEntity.save.resolves();
    this.localFS.readFile.returns('file data');
    this.twitter.upload.returns('image-media-id');

    const event = makeEvent(attachments);
    return this.receivedAttachments(event)
      .then(() => {
        expect(this.localFS.writeFile).toBeCalledWith('/tmp/objectId-0.jpeg', 'image data');
        expect(this.imageManipulation.fixup).toBeCalledWith('/tmp/objectId-0.jpeg')
        expect(this.cloudStorage.upload).toBeCalledWith(
          '/tmp/objectId-0.jpeg',
          {
            destination: '/originals/images/objectId-0.jpeg',
            resumable: false,
            public: false,
            gzip: false,
          }
        );
        expect(this.imageManipulation.compress).toBeCalledWith('/tmp/objectId-0.jpeg')
        expect(this.cloudStorage.upload).toBeCalledWith(
          '/tmp/objectId-0.jpeg',
          {
            destination: '/images/objectId-0.jpeg',
            resumable: false,
            public: true,
            gzip: false,
            metadata: {
              cacheControl: 'public, max-age=86400',
            },
          }
        );
        expect(this.imageManipulation.getSize).toBeCalledWith('/tmp/objectId-0.jpeg')
        expect(this.postsEntity.save).toBeCalledWith('objectId-0', '/images/objectId-0.jpeg', 'objectId');
        // need to check if we should use /tmp/ or /images/
        expect(this.localFS.readFile).toBeCalledWith('/tmp/objectId-0.jpeg')
        expect(this.twitter.upload).toBeCalledWith(1000, 'image/jpeg', 'file data');
        expect(this.twitter.tweet).toBeCalledWith('image-media-id');
      });
  });

  it('exits when missing attachments data', function() {
    const event = makeEvent();
    return this.receivedAttachments(event);
  });

  it('skips attachments that are too large', function() {
    const data = _.map(attachments, (attachment) => _.extend({}, attachment, { size: 20000000 }));
    const event = makeEvent(data);
    return this.receivedAttachments(event);
  });

  it('skips attachments with non-image content types', function() {
    const data = _.map(attachments, (attachment) => _.extend({}, attachment, { 'content-type': 'application/pdf' }));
    const event = makeEvent(data);
    return this.receivedAttachments(event);
  });
});

describe('reprocessImages', function() {
  beforeEach(function() {
    this.localFS = fakes.localFS();
    this.cloudStorage = fakes.cloudStorage();
    this.postsEntity = sinon.stub(new PostsEntity());
    this.imageManipulation = fakes.imageManipulation();
    this.reprocessImages = makeReprocessImages(this.localFS, this.cloudStorage, this.postsEntity, this.imageManipulation);
  });

  it('runs successfully', function() {
    this.cloudStorage.download.resolves(['image data']);
    this.imageManipulation.getSize.resolves({
      height: 10,
      width: 100,
    });

    const event = {
      data: {
        json: {
          pathsToReprocess: ["/originals/images/objectId-0.jpeg"],
        }
      }
    };
    return this.reprocessImages(event)
      .then(() => {
        expect(this.cloudStorage.download).toBeCalledWith('/originals/images/objectId-0.jpeg');
        expect(this.localFS.writeFile).toBeCalledWith('/tmp/objectId-0.jpeg', 'image data');
        expect(this.imageManipulation.compress).toBeCalledWith('/tmp/objectId-0.jpeg', 960)
        expect(this.cloudStorage.upload).toBeCalledWith(
          '/tmp/objectId-0.jpeg',
          {
            destination: '/images/objectId-0.jpeg',
            resumable: false,
            public: true,
            gzip: false,
            metadata: {
              cacheControl: 'public, max-age=86400',
            },
          }
        );
        expect(this.imageManipulation.getSize).toBeCalledWith('/tmp/objectId-0.jpeg')
        expect(this.postsEntity.save).toBeCalledWith('objectId-0', '/images/objectId-0.jpeg', 'objectId');
      });
  });
});

