const _ = require('lodash');
const Logger = require('../Logger');

module.exports = function makeRenderIndex(objectId, nextApp, postsEntity) {
  return function renderIndex(request, response) {
    const requestId = objectId.generate();
    const log = new Logger(requestId);

    request.dependencies = {
      postsEntity,
    };
    return nextApp(request, response);
  };
}

