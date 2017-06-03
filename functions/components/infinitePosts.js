import _ from 'lodash';
import React from 'react'
import { AutoSizer, InfiniteLoader, List, WindowScroller } from 'react-virtualized';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';

export default class extends React.Component {
  static propTypes = {
    posts: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      posts: props.posts,
    };
  }

  render() {
    // We don't know the total number of posts there are here, so use an arbitrarily large number (docs say this is ok).
    return <InfiniteLoader
      rowCount={1000}
      isRowLoaded={this.isRowLoaded}
      loadMoreRows={this.loadMoreRows}
      threshold={5}>
      {({ onRowsRendered, registerChild }) => (
        <AutoSizer onResize={this.onResize} disableHeight>
          {({ width }) => (
            <WindowScroller>
              {({ height, isScrolling, scrollTop }) => (
                <List
                  autoHeight
                  ref={(c) => {
                    registerChild(c);
                    this.postList = c
                  }}
                  height={height}
                  isScrolling={isScrolling}
                  rowCount={this.state.posts.length}
                  rowHeight={this.rowHeight}
                  rowRenderer={this.renderPost}
                  scrollTop={scrollTop}
                  width={width}
                  onRowsRendered={onRowsRendered}
                />
              )}
            </WindowScroller>
          )}
        </AutoSizer>
      )}
    </InfiniteLoader>
  }

  isRowLoaded = ({index}) => {
    return !!this.state.posts[index];
  }

  loadMoreRows = () => {
    // fetch more posts "before" the last post in the list since they're in reverse chronological order
    return fetch(`/fetchPosts?before=${_.last(this.state.posts).post_id}`)
      .then(res => res.json())
      .then(newPosts => {
        this.setState((prevState, props) => ({
          posts: prevState.posts.concat(newPosts),
        }));
      });
  }

  // Record the current width so image heights can be scaled
  // This will fire with the initial size too.
  onResize = ({height, width}) => {
    this.setState({ width }, () => {
      // We need to tell the List to recompute the heights of its rows when the window size changes
      // since the heights are scaled proportionately to the window's width.
      // The results of rowHeight are cached and must be explicitly invalidated.
      this.postList.recomputeRowHeights();
    });
  }

  // We know the width we want images to have (100%) but need to calculate a logical height based on that
  // so the list container can know the height of each image to calculate what's currently visible.
  // Scale the actual image height to the desired height based on the current width of the container.
  rowHeight = ({index}) => {
    const post = this.state.posts[index];
    const heightToWidth = post.image_height / post.image_width;
    return _.toInteger(this.state.width * heightToWidth);
  }

  renderPost = ({index, key, style}) => {
    const post = this.state.posts[index];
    // Set an explicit height (scaled proportionately off the window's width) so its dimensions will resize
    // with the appropriate ratio when the window resizes.
    return <img src={post.image_url} key={key} style={_.extend({}, style, { height: this.rowHeight({index}) })}/>;
  }
}
