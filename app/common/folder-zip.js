import yauzl from 'yauzl';
import yazl from 'yazl';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import glob from 'glob';

// const sourceDir = 'C:/Users/Erwin/Desktop/uz';
// const targetFileName = 'C:/Users/Erwin/Desktop/Superneu.zip';

// const sourceFileName = 'C:/Users/Erwin/Desktop/Arlen - Somewhere Over The Rainbow  (m. Refrain).avd';
// const targetDir = 'C:/Users/Erwin/Desktop/uz';

// zip(sourceDir, targetFileName, err => console.log(err || 'Done!'));
// unzip(sourceFileName, targetDir, err => console.log(err || 'Done!'));

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
          mkdirp(unzippedFileName, function (err) {
            if (err) return cb && cb(err);
            zipfile.readEntry();
          });
        } else {
          // file entry
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) return cb && cb(err);
            // ensure parent directory exists
            mkdirp(path.dirname(unzippedFileName), function (err) {
              if (err) return cb && cb(err);
              readStream.pipe(fs.createWriteStream(unzippedFileName));
              readStream.on('end', () => zipfile.readEntry());
              readStream.on('error', err => cb && cb(err));
            });
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

export default { zip, unzip };
