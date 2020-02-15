const _ = require('lodash');

class PostsEntity {
  constructor(datastore, contentBaseUrl) {
    this.datastore = datastore;
    this.contentBaseUrl = contentBaseUrl;
  }

  // TODO clean up this API, validate data before saving
  save(postId, cloudStoragePath, submissionId, {height, width}) {
    const entity = {
      // use the postId as the identifier to allow for idempotent updates to a post
      key: this.datastore.key(['posts', postId]),
      method: 'upsert',
      data: [
        {
          name: 'post_id',
          value: postId,
        },
        {
          name: 'image_path',
          value: cloudStoragePath,
          excludeFromIndexes: true,
        },
        {
          name: 'image_height',
          value: height,
          excludeFromIndexes: true,
        },
        {
          name: 'image_width',
          value: width,
          excludeFromIndexes: true,
        },
        {
          name: 'submission_id',
          value: submissionId,
        },
      ],
    };
    return this.datastore.save(entity);
  }

  findPosts(conds = {}) {
    if (conds.before && conds.after) {
      throw new Error('only specify one of before and after');
    }

    let query = this.datastore.createQuery('posts')
      .order('post_id', { descending: true })
      .limit(10);

    if (conds.before) {
      query = query.filter('post_id', '<', conds.before);
    }

    if (conds.after) {
      query = query.filter('post_id', '>', conds.after);
    }

    return this.datastore.runQuery(query)
      .then(this._processResults.bind(this));
  }

  _processResults(results) {
    const posts = results[0];
    return _.map(posts, (post) => {
      let imagePath = post.image_path;
      if (!imagePath.startsWith('/')) {
        imagePath = `/${imagePath}`;
      }
      return _.extend({}, post, {
        image_url: `${this.contentBaseUrl}${imagePath}`,
      });
    });
  }
};

module.exports = PostsEntity;
