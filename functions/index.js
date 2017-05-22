var functions = require('firebase-functions');

exports.helloWorld = functions.https.onRequest((request, response) => {
  console.log('request.body', request.body)

  let body = '';
  request.on('data', (data) => {
    body += data;
  });

  request.on('end', () => {
    console.log('raw body', body);
    response.status(200).send();
  });

});
