process.env.GCLOUD_PROJECT = 'snacksdev'; // Set the datastore project Id globally
const express = require('express');
const next = require('next')
const { createServer } = require('http')
const Datastore = require('@google-cloud/datastore');
const DatastoreEmulator = require('google-datastore-emulator');
const ObjectId = require('bson-objectid');

const PostsEntity = require('./lib/entities/posts');
const makeRenderIndex = require('./lib/http/renderIndex');
const makeFetchPosts = require('./lib/http/fetchPosts');

const nextApp = next({ dev: true });

const emulator = new DatastoreEmulator({ port: 9021 });

process.on('SIGINT', () => {
  console.log('Stopping emulator');
  emulator.stop().then(() => process.exit());
});

console.log('Starting cloud datastore emulator');
emulator.start()
  .then(() => {
    const seed = require('./seed');
    return Promise.all([nextApp.prepare(), seed()])
  })
  .then(() => {
    const datastore = Datastore();
    const postsEntity = new PostsEntity(datastore, "https://storage.googleapis.com/snacks-content");
    const renderIndex = makeRenderIndex(ObjectId, nextApp.getRequestHandler(), postsEntity)
    const fetchPosts = makeFetchPosts(ObjectId, postsEntity);

    const app = express();
    app.get('/fetchPosts', fetchPosts);
    app.get('/*', renderIndex);

    console.log('Starting dev server');
    createServer(app)
      .listen(3000, (err) => {
        if (err) throw err
        console.log('> Ready on http://localhost:3000')
      });
  })
  .catch(err => {
    console.error('Error starting development server', err);
    throw err
  });
