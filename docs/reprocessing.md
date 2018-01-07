# Reprocessing Data
All processing is meant to be idempotent, and data is archived as its flows through the system.
This allows posts to be reprocessed should there be an error during the initial attempt.
Reprocessing emails or images should not result in duplicate posts, the existing data (if any) will be updated in place.

## Reprocess emails
Mailgun retains emails for up to 3 days.
During that time they can be replayed to download and process their attachments again.

`gcloud beta pubsub topics publish replay-emails --message '{"requestPathsToReplay": ["path/to/json"]}'`

## Reprocess images
An individual post can be reprocessed by its path in Google Cloud Storage.
It is recommended that the original photo (not the recompressed image) be reprocessed.

`gcloud beta pubsub topics publish reprocess-images --message '{"pathsToReprocess": ["id"]}'`

## Reprocess All Images
[scripts/reprocess-all-images.sh](../scripts/reprocess-all-images.sh) can be used to reprocess all posts.
It's useful for updating public post images after changing compression settings.

