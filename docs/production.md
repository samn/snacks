# Production Setup

## Firebase Configuration

See [firebase.json](../firebase.json).

### Function Configuration
See [functions/README.md](../functions/README.md#function-configuration) for a description of required function parameters and deployment instructions.

### Hosting Setup
The web application will work find when hosted on a Firebase domain, but if you wish to use your own domain you'll need to verify it in the Firebase console first.

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
