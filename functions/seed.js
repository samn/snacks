const datastore = require('@google-cloud/datastore')()

const PostsEntity = require('./lib/entities/posts');

const postsEntity = new PostsEntity(datastore);
const seedData = require('./seeds.json');

module.exports = function seed() {
  console.log(`Seeding ${seedData.posts.length} posts`);
  return Promise.all(seedData.posts.map(({ post_id, image_path, submission_id, image_width, image_height }) => {
    console.log('Seeding', post_id, image_path);
    const size = {
      width: image_width,
      height: image_height,
    };
    return postsEntity.save(post_id, image_path, submission_id, size);
  }))
    .then(() => console.log('Seeded posts data'))
    .catch(err => {
      console.error('Error seeding posts data', err)
      throw err;
    });
}
