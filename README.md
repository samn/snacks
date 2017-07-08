# snacks

[![Build Status](https://travis-ci.org/samn/snacks.svg?branch=master)](https://travis-ci.org/samn/snacks)

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


## Additional Docs
* [Firebase Functions Readme](functions/README.md)
* [Production Setup](docs/production.md)
* [Reprocessing Data](docs/reprocessing.md)


## License
Copyright 2017, Sam Neubardt.

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

