import React from 'react'
import Head from 'next/head'
import fetch from 'isomorphic-fetch';

import InifintePosts from '../components/infinitePosts';

export default class extends React.Component {
  // TODO what if there's an error that gets `await`ed?
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
      <Head>
        <title>SNACKS</title>
      </Head>
      <style global jsx>{`
        body {
          margin: 0;
        }
    `}</style>
      <div>
        <InifintePosts posts={this.props.posts} />
      </div>
    </div>
  }
}
