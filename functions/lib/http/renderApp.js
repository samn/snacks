const _ = require('lodash');
const Logger = require('../Logger');

module.exports = function makeRenderApp(objectId, nextApp, postsEntity) {
  return function renderApp(request, response) {
    const requestId = objectId.generate();
    const log = new Logger(requestId);

    log.info(request.path)

    request.dependencies = {
      postsEntity,
    };
    return nextApp(request, response);
  };
}

