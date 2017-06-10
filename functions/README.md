## Initial Setup
1. `yarn install`

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

## GCP Configuration

### Topics
The following must be created:
* `received-attachments`: new attachment metadata are enqueued here
* `replay-jobs`: to manually re-process messages

### Function Configuration
The following must be set with `firebase functions:config:set`:

* `mailgun.apikey`: Mailgun API key
* `incomingmessages.bucket`: the bucket where incoming messages are saved (so they can be replayed if needed).
* `content.bucket`: the bucket where media is stored
* `content.baseurl`: the base of content URLs. E.g. `https://storage.googleapis.com/${content.bucket}`

### Cloud Storage Configuration
Since Mailgun only retains stored emails for 3 days its recommended that the lifecycle policy in `incoming-messages-bucket-lifecycle.json` be applied to the bucket configured in `incomingmessages.bucket`.

```
gsutil lifecycle set incoming-messages-bucket-lifecycle.json gs://BUCKET-NAME
```

## Mailgun Configuration
Setup a routing rule to store messages for the desired address.
The `store` call should be configured with the URL to the `receiveEmail` function.
