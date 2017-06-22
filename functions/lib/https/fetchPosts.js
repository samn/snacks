const _ = require('lodash');
const render = require('./render');

module.exports = function makeFetchPosts(postsEntity) {
  return function fetchPosts(request, response) {
    const conditions = _.pick(request.query, ['before', 'after']);
    postsEntity.findPosts(conditions)
      .then(render.success(response))
      .catch(render.failure(request.log, response));
  };
}
