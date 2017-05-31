const next = require('next')
const { createServer } = require('http')
const cloudDatastore = require('@google-cloud/datastore')({
  projectId: 'snacksdev',
});
const ObjectId = require('bson-objectid');

const PostsEntity = require('./lib/entities/posts');
const postsEntity = new PostsEntity(cloudDatastore, "https://storage.googleapis.com/snacks-content");
const makeRenderIndex = require('./lib/http/renderIndex');

const app = next({ dev: true });
app.prepare().then(() => {
  const renderIndex = makeRenderIndex(ObjectId, app.getRequestHandler(), postsEntity)
  // TODO use express to route to renderIndex and API endpoints
  createServer(renderIndex)
    .listen(3000, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    });
});
