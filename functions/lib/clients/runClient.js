const Twitter = require('./clientTest'); //require('./twitterClient'); //
const fdata = require('fs-extra').readFileSync('./giphy.gif');
const size = fdata.length;
const type = "image/gif"

const twitter = new Twitter(
    process.env.twittCK,
    process.env.twittCS,
    process.env.twittAT,
    process.env.twittAS
);

twitter.tweetMedia(size, type, fdata);


