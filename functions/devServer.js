const express = require('express');
const next = require('next')
const { createServer } = require('http')
const cloudDatastore = require('@google-cloud/datastore')({
  // this projectId should match what the datastore emulator is started with
  projectId: 'snacksdev',
});
const ObjectId = require('bson-objectid');

const PostsEntity = require('./lib/entities/posts');
const postsEntity = new PostsEntity(cloudDatastore, "https://storage.googleapis.com/snacks-content");
const makeRenderIndex = require('./lib/http/renderIndex');
const makeFetchPosts = require('./lib/http/fetchPosts');

const nextApp = next({ dev: true });
nextApp.prepare().then(() => {
  const renderIndex = makeRenderIndex(ObjectId, nextApp.getRequestHandler(), postsEntity)
  const fetchPosts = makeFetchPosts(ObjectId, postsEntity);
  const app = express();
  app.get('/fetchPosts', fetchPosts);
  app.get('/*', renderIndex);
  createServer(app)
    .listen(3000, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    });
});
