const _ = require('lodash');
const expect = require('expect')
const fakes = require('../fakes');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');
const attachments = JSON.parse(requestBody.attachments);
const PostsEntity = require('../../lib/entities/posts');

describe('PostsEntity', function() {
  beforeEach(function() {
    this.datastore = fakes.datastore();
    this.entity = new PostsEntity(this.datastore, 'http://cdn/');
  });

  describe('save', function() {
    it('calls datastore', function() {
      this.datastore.key.returnsArg(0);
      this.datastore.save.resolves();

      this.entity.save('objectId-0', '/images/objectId-0.jpeg', 'objectId', { width: 100, height: 10 });

      expect(this.datastore.save).toBeCalledWith({
        key: ['posts', 'objectId-0'],
        method: 'upsert',
        data: [
          {
            name: 'post_id',
            value: 'objectId-0',
          },
          {
            name: 'image_path',
            value: '/images/objectId-0.jpeg',
            excludeFromIndexes: true,
          },
          {
            name: 'image_height',
            value: 10,
            excludeFromIndexes: true,
          },
          {
            name: 'image_width',
            value: 100,
            excludeFromIndexes: true,
          },
          {
            name: 'submission_id',
            value: 'objectId',
          },
        ],
      });
    });
  });

  describe('findLatest', function() {
    // TODO
  });
});
