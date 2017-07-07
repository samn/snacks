## Initial Setup
1. `yarn install`
1. `firebase use`

## Tests
Written with [mocha](https://mochajs.org/) and [expect](https://github.com/mjackson/expect).

* `yarn test`
* `yarn autotest` to automatically re-run on file changes

## Development
1. Start dev server
  * `yarn dev`

## Deployment
1. `ASSET_PREFIX="your-domain" yarn build`
1. `firebase deploy`

## Function Configuration
The following must be set with `firebase functions:config:set`:

* `mailgun.apikey`: Mailgun API key
* `incomingmessages.bucket`: the bucket where incoming messages are saved (so they can be replayed if needed).
* `content.bucket`: the bucket where media is stored
* `content.baseurl`: the base of content URLs. E.g. `https://storage.googleapis.com/${content.bucket}`, or a CDN.
