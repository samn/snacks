const _ = require('lodash');
const expect = require('expect')
const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const makeFetchPosts = require('../../lib/http/fetchPosts');
const PostsEntity = require('../../lib/entities/posts');

describe('fetchPosts', function() {
  beforeEach(function() {
    this.postsEntity = sinon.stub(new PostsEntity());

    const objectId = {
      generate: _.constant('objectId'),
    };

    const fetchPosts = makeFetchPosts(objectId, this.postsEntity);
    const app = express()
      .get('/', fetchPosts);

    this.makeRequest = function(query) {
      return request(app)
        .get('/')
        .set('Content-Type', 'application/json')
        .query(query);
    };
  });

  it('returns fetched posts', function() {
    const posts = [
      {
        fake: 'post',
      },
    ];
    this.postsEntity.findPosts.resolves(posts);
    return this.makeRequest({ before: 'objectId' }).expect(200)
    .then(() => {
      expect(this.postsEntity.findPosts).toBeCalledWith({ before: 'objectId' });
    });
  });
});
