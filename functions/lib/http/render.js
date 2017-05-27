exports.success = function success(response) {
  return function() {
    response.status(200).end();
  };
}

exports.failure = function failure(log, response) {
  return function(err) {
    log.error(err);
    response.status(500).end();
  };
}
