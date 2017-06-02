const _ = require('lodash');
const Logger = require('../Logger');
const render = require('./render');

module.exports = function makeFetchPosts(objectId, postsEntity) {
  return function fetchPosts(request, response) {
    const conditions = _.pick(request.query, ['before', 'after']);
    postsEntity.findPosts(conditions)
      .then(posts => {
        response.status(200).send(posts);
      })
      .catch(render.failure);
  };
}
