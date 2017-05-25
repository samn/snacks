const expect = require('expect')

exports.pubSub = function makeFakePubSub(opts) {
  expect(opts).toExist();
  return {
    publish(message, options) {
      expect(message).toEqual(opts.message);
      expect(options).toEqual({
        raw: true,
      });

      if (opts.err) {
        return Promise.reject(opts.err);
      } else {
        return Promise.resolve();
      }
    },
  };
}

exports.cloudStorage = function makeFakeCloudStorage(opts) {
  expect(opts).toExist();
  return {
    upload(path, options) {
      expect(path).toEqual(opts.path);
      expect(options).toEqual(opts.options)

      if (opts.err) {
        return Promise.reject(opts.err);
      } else {
        return Promise.resolve();
      }
    },
    download(path) {
      expect(path).toEqual(opts.path);

      if (opts.err) {
        return Promise.reject(opts.err);
      } else {
        return Promise.resolve(opts.data);
      }
    }
  };
}

exports.localFS = function makeFakeLocalFS(opts) {
  expect(opts).toExist();
  return {
    writeJSON(path, data) {
      expect(data).toEqual(opts.data);
      expect(path).toEqual(opts.path);

      if (opts.err) {
        return Promise.reject(opts.err);
      } else {
        return Promise.resolve();
      }
    },
  };
}

