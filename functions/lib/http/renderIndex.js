const _ = require('lodash');
const Logger = require('../Logger');
const render = require('./render');

module.exports = function makeRenderIndex(objectId, contentBaseUrl, postsEntity) {
  return function renderIndex(request, response) {
    const submissionId = objectId.generate();
    const log = new Logger(submissionId);

    postsEntity.findLatest()
      .then((posts) => {
        let images = '<div>';
        _.forEach(posts, (post) => {
          images += `<img src="${contentBaseUrl}${post.image_path}"/>\n`;
        });
        images += '</div>';

        response.status(200).send(`<!doctype html>
        <head>
          <title>SNACKS</title>
          <style type="text/css">
            img {
              width: 100%;
            }
          </style>
        </head>
        <body>
          ${images}
        </body>
      </html>`);
      })
    // TODO show an error page
      .catch(render.failure(log, response))
  };
}

