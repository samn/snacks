exports.requestPath = function requestPath(filename) {
  return `requests/receiveEmail/${filename}`;
}

exports.tempFilePath = function tempFilePath(filename) {
  return `/tmp/${filename}`;
}

exports.originalPath = function originalPath(filename) {
  return `originals/images/${filename}`;
}

exports.uploadPath = function uploadPath(filename) {
  return  `images/${filename}`;
}
