exports.success = function success(response) {
  return function(data) {
    if (data) {
      response.status(200).send(data);
    } else {
      response.status(200).end();
    }
  };
}

exports.failure = function failure(log, response) {
  return function(err) {
    log.error(err);
    response.status(500).end();
  };
}
