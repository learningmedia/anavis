const yauzl = require('yauzl');
const yazl = require('yazl');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const glob = require('glob');

function zip(sourceDir, targetFileName, cb) {
  sourceDir = sourceDir.replace(/\/?$/, '/');
  glob(`${sourceDir}**/*`, { nodir: true, dot: true }, function (err, files) {
    if (err) return cb && cb(err);
    const zipfile = new yazl.ZipFile();
    (files || []).forEach(function (file) {
      const relativeFileName = path.relative(sourceDir, file);
      zipfile.addFile(file, relativeFileName);
    });
    const writeStream = fs.createWriteStream(targetFileName);
    writeStream.on('error', err => cb && cb(err));
    writeStream.on('finish', () => cb && cb());
    zipfile.outputStream.pipe(writeStream);
    zipfile.end();
  });
}

function unzip(sourceFileName, targetDir, cb) {
  yauzl.open(sourceFileName, { lazyEntries: true }, function (err, zipfile) {
    if (err) return cb && cb(err);
    zipfile
      .on('entry', function (entry) {
        const unzippedFileName = path.join(targetDir, entry.fileName);
        if (/\/$/.test(unzippedFileName)) {
          // directory file names end with '/'
          mkdirp(unzippedFileName)
            .then(() => zipfile.readEntry())
            .catch(err => cb && cb(err));
        } else {
          // file entry
          zipfile.openReadStream(entry, function (err1, readStream) {
            if (err1) return cb && cb(err1);
            // ensure parent directory exists
            mkdirp(path.dirname(unzippedFileName))
              .then(() => {
                readStream.pipe(fs.createWriteStream(unzippedFileName));
                readStream.on('end', () => zipfile.readEntry());
                readStream.on('error', err2 => cb && cb(err2));
              })
              .catch(err3 => cb && cb(err3));
          });
        }
      })
      .on('error', function (err) {
        zipfile.close();
        return cb && cb(err);
      })
      .on('end', function () {
        zipfile.close();
        return cb && cb();
      });
    zipfile.readEntry();
  });
}

module.exports = { zip, unzip };
