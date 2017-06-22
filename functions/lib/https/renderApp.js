const _ = require('lodash');

module.exports = function makeRenderApp(nextApp, postsEntity) {
  return function renderApp(request, response) {
    request.log.info(request.path)

    request.dependencies = {
      postsEntity,
    };
    return nextApp(request, response);
  };
}

