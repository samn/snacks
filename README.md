# snacks

## What it is
https://snacksnacksnacksnacksnack.com/

Email a photo to `snack` at that domain and it'll get posted.
There's no metadata or attribution — post cool things and don't be a jerk.

You can run snacks on your own domain using Firebase, Google Cloud Platform, and Mailgun.

## How it works

Mailgun is configured to call a webhook when emails are received.
That webhook (the `receiveEmail` function in this code base) downloads the attachments and processes them in another function (`receivedAttachmentsPubSub`).
EXIF data is stripped, and images are resized and compressed.
The processed images are stored in a Google Cloud Storage bucket, and an index is stored in Google Cloud Datastore.

The `receiveEmail` function generates a BSON Object Id to identify the post.
This id is used throughout the system as a consistent key across functions (logs can be correlated this way).
The original post (at its original resolution but without EXIF data) is archived separately to facilitate reprocessing without recompression.
Object Ids are naturally sorted by time which is convenient for sorting posts by when they were received.

The site is built with Next.js & React.
Posts (a link to the image & its dimensions) are retrieved from the Datastore.
The inital render ocurrs server side, and additional posts are fetched as the page scrolls.

## Functions
See [functions/README.md](functions/README.md)

## Mailgun Configuration
Setup a routing rule to store messages for the desired address.
The `store` call should be configured with the URL to the `receiveEmail` function.

## GCP Configuration

### Topics
The following must be created:
* `received-attachments`: new attachment metadata are enqueued here
* `replay-jobs`: to manually reprocess emails from Mailgun
* `reprocess-images`: to manually reprocess images from storage

### Cloud Storage Configuration
Since Mailgun only retains stored emails for 3 days its recommended that the lifecycle policy in `incoming-messages-bucket-lifecycle.json` be applied to the bucket configured in `incomingmessages.bucket`.

```
gsutil lifecycle set incoming-messages-bucket-lifecycle.json gs://BUCKET-NAME
```

### Function Configuration
See [functions/README.md](functions/README.md#function-configuration).

## Reprocessing Data
All processing is meant to be idempotent, and data is archived as its flows through the system.
This allows posts to be reprocessed should there be an error during the initial attempt.
Reprocessing emails or images should not result in duplicate posts, the existing data (if any) will be updated in place.

### Reprocess emails
Mailgun retains emails for up to 3 days.
During that time they can be replayed to download and process their attachments again.

`gcloud beta pubsub topics publish replay-jobs '{"requestIdsToReplay": ["id"]}'`

### Reprocess images
An individual post can be reprocessed by its path in Google Cloud Storage.
It is recommended that the original photo (not the recompressed image) be reprocessed.

`gcloud beta pubsub topics publish reprocess-images '{"pathsToReprocess": ["id"]}'`

## License
Copyright 2017, Sam Neubardt.

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

