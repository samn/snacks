const _ = require('lodash');
const Logger = require('../Logger');

module.exports = function makeRenderIndex(objectId, nextApp, postsEntity) {
  return function renderIndex(request, response) {
    const submissionId = objectId.generate();
    const log = new Logger(submissionId);

    request.dependencies = {
      postsEntity,
    };
    return nextApp(request, response);
  };
}

