const _ = require('lodash');
const Logger = require('../Logger');

// TODO rename to renderApp
module.exports = function makeRenderIndex(objectId, nextApp, postsEntity) {
  return function renderIndex(request, response) {
    const submissionId = objectId.generate();
    const log = new Logger(submissionId);

    // TODO extract this pattern
    request.dependencies = {
      postsEntity,
    };
    return nextApp(request, response);
  };
}

