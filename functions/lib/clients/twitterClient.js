const Twitter = require('twitter')

exports.makeTwitterClient = function makeTwitterClient(consumer_key, consumer_secret, access_token, access_token_secret) {

    return new Twitter({
        consumer_key: consumer_key,
        consumer_secret: consumer_secret,
        access_token_key: access_token,
        access_token_secret: access_token_secret,
    });
}

// uploadTwitterMedia implementation from https://github.com/desmondmorris/node-twitter
exports.uploadTwitterMedia = function uploadTwitterMedia(client, mediaSize, mediaType, mediaData) {
  return initUpload() // Declare that you wish to upload some media
    .then(appendUpload) // Send the data for the media
    .then(finalizeUpload) // Declare that you are done uploading chunks
    .then(mediaId => {
      return mediaId;
    });

   function initUpload () {
      return makePost('media/upload', {
        command: 'INIT',
        total_bytes: mediaSize,
        media_type: mediaType,
      }).then(data => data.media_id_string);
    }

    function appendUpload (mediaId) {
      return makePost('media/upload', {
        command: 'APPEND',
        media_id: mediaId,
        media: mediaData,
        segment_index: 0
      }).then(data => mediaId);
    }

    function finalizeUpload (mediaId) {
      return makePost('media/upload', {
        command: 'FINALIZE',
        media_id: mediaId
      }).then(data => mediaId);
    }

    function makePost (endpoint, params) {
      return new Promise((resolve, reject) => {
        client.post(endpoint, params, (error, data, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });
    }
}

exports.sendTweet = function sendTweet(client, mediaId) {
  const status = {
    status: '',
    media_ids: mediaId
  }
  client.post('statuses/update', status, function(error, tweet, response) {
    if (!error) {
      console.log(tweet);
    }
  });
}
