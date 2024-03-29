"use strict";

var fs = require('fs');

var deleteFile = function deleteFile(filepath) {
  return fs.unlink(filepath, function (err) {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;