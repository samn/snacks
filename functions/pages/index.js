import React from 'react'
import Head from 'next/head'

import InifintePosts from '../components/infinitePosts';

export default class extends React.Component {
  static async getInitialProps ({ req }) {
    // TODO is this the correct pattern? How else can i DI things into this component?
    // Study this a little better https://github.com/CityOfBoston/registry-certs/blob/develop/client/page.js
    // https://github.com/CityOfBoston/registry-certs/blob/develop/client/loopback-graphql.js#L107
    if (process.browser) {
      // TODO
      console.log('Index getInitialProps from browser');
      return {
      };
    } else if (req) {
      console.log('Index getInitialProps fetching latest posts');
      // TODO what if there's an error
      const posts = await req.dependencies.postsEntity.findPosts();
      return {
        posts
      };
    } else {
      // TODO
      console.log('!! Not browser, no request');
    }
  }
  render () {
    return <div>
      <Head>
        <title>SNACKS</title>
      </Head>
      <div>
        <InifintePosts posts={this.props.posts} />
      </div>
    </div>
  }
}

// pages should have no rendering, they should be like controllers
// fetch data via getInitialProps and pass as props to child components with actual view logic
// that way the page can use dependencies that create non-injected versions of clients
// the clients can be tested in isolation with DI, as can the actual views
// the parts that are hard to test are isolated to the page (controller) and page dependencies
// i think that's a reasonable trade off between dependency injection for clean tests and fitting into the framework
