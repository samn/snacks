const _ = require('lodash');
const express = require('express');
const ObjectId = require('bson-objectid');

const Logger = require('../Logger');

module.exports = function makeMainApp(renderApp, fetchPosts) {
  const app = express();

  app.use((request, response, next) => {
    const requestId = ObjectId.generate();
    const log = new Logger(requestId);

    _.extend(request, { requestId, log });

    next();
  });

  app.get('/fetchPosts', fetchPosts);
  app.get('/*', renderApp);

  return app;
}
