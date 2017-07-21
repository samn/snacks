const twitterClient = require('twitter')


class Twitter {
  constructor(consumer_key, consumer_secret, access_token, access_token_secret) {
    this.client = new twitterClient({
      consumer_key: consumer_key,
      consumer_secret: consumer_secret,
      access_token_key: access_token,
      access_token_secret: access_token_secret
    });
  }


  tweetMedia(mediaSize, mediaType, mediaData) {
    return this._initUpload(mediaSize, mediaType)
      .then((data) => {
        return this._appendUpload(data, mediaData);
      })
      .then((data) => {
        return this._finalizeUpload(data);
      })
      .then((data) => {
        return this._sendTweet(data);
      })
  }

  _initUpload(mediaSize, mediaType) {
    return this._makePost('media/upload', {
      command: 'INIT',
      total_bytes: mediaSize,
      media_type: mediaType,
    }).then(data => data.media_id_string);
  }

  _appendUpload(mediaId, mediaData) {
    return this._makePost('media/upload', {
      command: 'APPEND',
      media_id: mediaId,
      media: mediaData,
      segment_index: 0
    }).then(data => mediaId);
  }

  _finalizeUpload(mediaId) {
    return this._makePost('media/upload', {
      command: 'FINALIZE',
      media_id: mediaId
    }).then(data => mediaId);
  }

  _makePost(endpoint, params) {
    return this.client.post(endpoint, params);
  }

  _sendTweet(mediaId) {
    return this.client.post('statuses/update', {
      status: '',
      media_ids: mediaId
    });
  }
}

module.exports = Twitter;
