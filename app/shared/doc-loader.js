const fs = require('fs');
const path = require('path');
const avdReader = require('./mappings/avd-reader');

function openDocument(avdFileName, cb) {
  avdReader.readAvdFile(avdFileName, function (err, unzipDir) {
    if (err) return cb && cb(err);
    readDocument(unzipDir, cb);
  });
}

function readDocument(unzipDir, cb) {
  const docFileName = path.join(unzipDir, 'anavis.json');
  fs.readFile(docFileName, 'utf8', function (err, content) {
    if (err) return cb && cb(err);
    return cb && cb(null, JSON.parse(content), unzipDir);
  });
}

module.exports = {
  openDocument,
  readDocument
};
