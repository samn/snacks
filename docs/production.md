# Production Setup

## Firebase Configuration

See [firebase.json](../firebase.json).

### Function Configuration
The following must be set with `firebase functions:config:set`:

* `mailgun.apikey`: Mailgun API key
* `incomingmessages.bucket`: the bucket where incoming messages are saved (so they can be replayed if needed).
* `content.bucket`: the bucket where media is stored
* `content.baseurl`: the base of content URLs. E.g. `https://storage.googleapis.com/${content.bucket}`, or a CDN.

Recommended Memory Allocations:

* `mainApp`: 512mb
* `receivedAttachmentsPubSub`: 2gb
* `receiveEmail`: 512mb
* `replayEmailsPubSub`: 256mb
* `reprocessImagesPubSub`: 2gb

### Hosting Setup
The web application will work fine when hosted on a Firebase domain, but if you wish to use your own domain you'll need to verify it in the Firebase console first.

## Google Cloud Platform Configuration

### Topics
The following topics will be created when the Firebase Functions are deployed:
* `received-attachments`: new attachment metadata are enqueued here
* `replay-emails`: to manually reprocess emails from Mailgun
* `reprocess-images`: to manually reprocess images from storage

### Cloud Storage Configuration
Since Mailgun only retains stored emails for 3 days its recommended that the lifecycle policy in [incoming-messages-bucket-lifecycle.json](../incoming-messages-bucket-lifecycle.json) be applied to the bucket configured in `incomingmessages.bucket`.

```
gsutil lifecycle set incoming-messages-bucket-lifecycle.json gs://BUCKET-NAME
```


## Mailgun Configuration
After configuring your domain with Mailgun, you need to configure it to forward new messages to the `receiveEmail` function.

Click on the "Routes" tab, then "Create Route".
The expression type should be "Match Recipient", and the action should be "Store and notify".
The address given to "Store and notify" should be the URL to the `receiveEmail` function (you can see that URL after running `firebase deploy`).

## Deployment
(From the `functions/` directory)

1. `ASSET_PREFIX="your-domain" yarn build`
1. `firebase deploy`
