## Initial Setup
1. `yarn install`
1. `firebase use`
1. Install the [Google Cloud Datastore Emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator)

## Tests
Written with [mocha](https://mochajs.org/) and [expect](https://github.com/mjackson/expect).

* `yarn test`
* `yarn autotest` to automatically re-run on file changes

## Development
1. Start dev server (this automatically starts the Cloud Datastore Emulator and seeds it with sample data)
  * `yarn dev`

Currently only the webapp runs locally. Pubsub functions (e.g. for processing uploads) need to run in Firebase.
