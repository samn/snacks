class PostsEntity {
  constructor(cloudDatastore) {
    this.cloudDatastore = cloudDatastore;
  }

  findLatest() {
    const query = this.cloudDatastore.createQuery('posts')
      .order('post_id', {  descending: true })
      .limit(10);

    return this.cloudDatastore.runQuery(query)
      .then(results => results[0]);
  }
};

module.exports = PostsEntity;
