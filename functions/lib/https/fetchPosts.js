const _ = require('lodash');
const Logger = require('../Logger');
const render = require('./render');

module.exports = function makeFetchPosts(objectId, postsEntity) {
  return function fetchPosts(request, response) {
    const requestId = objectId.generate();
    const log = new Logger(requestId);

    const conditions = _.pick(request.query, ['before', 'after']);
    postsEntity.findPosts(conditions)
      .then(render.success(response))
      .catch(render.failure(log, response));
  };
}
