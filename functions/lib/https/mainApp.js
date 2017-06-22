const _ = require('lodash');
const express = require('express');

const Logger = require('../Logger');

module.exports = function makeMainApp(renderApp, fetchPosts) {
  const app = express();
  app.get('/fetchPosts', fetchPosts);
  app.get('/*', renderApp);

  return app;
}
