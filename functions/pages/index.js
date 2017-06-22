import React from 'react'
import fetch from 'isomorphic-fetch';

import InifintePosts from '../components/infinitePosts';

export default class extends React.Component {
  static async getInitialProps ({ req }) {
    if (process.browser) {
      const postsResponse = await fetch('/fetchPosts');
      if (!postsResponse.ok) {
        throw new Error(await res.text());
      }

      const posts = await postsResponse.json();
      return {
        posts
      };
    } else if (req) {
      const posts = await req.dependencies.postsEntity.findPosts();
      return {
        posts
      };
    }
  }
  render () {
    return <div>
      <InifintePosts posts={this.props.posts} />
    </div>
  }
}
