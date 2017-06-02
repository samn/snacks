const _ = require('lodash');
const expect = require('expect')
const fakes = require('../fakes');
const requestBody = require('../fixtures/requests/receiveEmail/body.json');
const attachments = JSON.parse(requestBody.attachments);
const PostsEntity = require('../../lib/entities/posts');

describe('PostsEntity', function() {
  beforeEach(function() {
    this.datastore = fakes.datastore();
    this.entity = new PostsEntity(this.datastore, 'http://cdn');
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

  describe('_processResults', function() {
    it('adds image_url', function() {
      const results = [
        [
          {
            post_id: 'objectId-0',
            image_path: '/images/objectId-0.jpeg',
            image_height: 10,
            image_width: 100,
            submission_id: 'objectId',
          },
        ],
      ];

      expect(this.entity._processResults(results)).toEqual(
        [
          {
            post_id: 'objectId-0',
            image_path: '/images/objectId-0.jpeg',
            image_height: 10,
            image_width: 100,
            submission_id: 'objectId',
            image_url: 'http://cdn/images/objectId-0.jpeg',
          },
        ]
      );
    });
  });
});
