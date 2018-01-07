#! /bin/bash
# Given a GCS bucket, enqueue a message to reprocess each original upload image

set -eu
bucket=$1
for full_path in `gsutil ls "gs://$bucket/originals/images"`; do
  path=${full_path#gs://$bucket}
  echo "Enqueuing reprocess for $path"
  gcloud beta pubsub topics publish reprocess-images --message "{\"pathsToReprocess\": [\"$path\"]}"
done
