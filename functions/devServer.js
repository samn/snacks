process.env.GCLOUD_PROJECT = 'snacksdev'; // Set the datastore project Id globally
const next = require('next')
const { createServer } = require('http')
const Datastore = require('@google-cloud/datastore');
const DatastoreEmulator = require('google-datastore-emulator');

const PostsEntity = require('./lib/entities/posts');
const makeRenderApp = require('./lib/https/renderApp');
const makeFetchPosts = require('./lib/https/fetchPosts');
const makeMainApp = require('./lib/https/mainApp');

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
    const renderApp = makeRenderApp(nextApp.getRequestHandler(), postsEntity)
    const fetchPosts = makeFetchPosts(postsEntity);
    const mainApp = makeMainApp(renderApp, fetchPosts);

    console.log('Starting dev server');
    createServer(mainApp)
      .listen(3000, (err) => {
        if (err) throw err
        console.log('> Ready on http://localhost:3000')
      });
  })
  .catch(err => {
    console.error('Error starting development server', err);
    throw err
  });
