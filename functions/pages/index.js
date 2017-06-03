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
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png"/>
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png"/>
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png"/>
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png"/>
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png"/>
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png"/>
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png"/>
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png"/>
        <link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
      </Head>
      <div>
        <InifintePosts posts={this.props.posts} />
      </div>
    </div>
  }
}
