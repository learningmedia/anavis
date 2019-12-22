const fs = require('fs');
const path = require('path');
const glob = require('glob');
const rimraf = require('rimraf');
const docLoader = require('../shared/doc-loader');

function checkCommandLine() {
  const ejectIndex = process.argv.indexOf('eject');
  if (ejectIndex !== -1) {
    return {
      commandName: 'eject',
      args: process.argv.slice(ejectIndex + 1)
    };
  }

  return null;
}

function runCommand({ commandName, args }, cb) {
  switch (commandName) {
    case 'eject':
      doEject(args, cb);
      break;
    default:
      cb(new Error(`Invalid command name: ${commandName}`));
      break;
  }
}

function doEject(args, cb) {
  if (!args.length) return cb(new Error('No file name specified'));

  const directoryMode = args.some(arg => ['-d', '--dir'].includes(arg));
  const fileOrDirName = args.filter(arg => !['-d', '--dir'].includes(arg))[0];

  if (!fileOrDirName) {
    return cb(new Error(`Missing ${directoryMode ? 'directory' : 'file'} name`));
  }

  const collectFiles = directoryMode
    ? func => glob(path.join(fileOrDirName, '*.avd'), func)
    : func => func(null, [fileOrDirName]);

  collectFiles((err, files) => {
    if (err) cb(err);

    if (!files || !files.length) {
      // eslint-disable-next-line no-console
      console.log(`No AnaVis files found in directory ${fileOrDirName}`);
    }

    ejectAvdFiles(files, 0, cb);
  });
}

function ejectAvdFiles(avdFileNames, index, cb) {
  const avdFileName = avdFileNames[index];
  if (!avdFileName) return cb();

  const jsonFileName = avdFileName + '.json';

  // eslint-disable-next-line no-console
  console.log(`Ejecting: ${avdFileName} -> ${jsonFileName}`);

  docLoader.openDocument(avdFileName, (err1, doc, unzipDir) => {
    if (err1) return cb(err1);

    const content = JSON.stringify(doc, null, 2);
    fs.writeFile(jsonFileName, content, 'utf8', err2 => {
      if (err2) return cb(err2);

      rimraf(unzipDir, err3 => {
        return err3 ? cb(err3) : ejectAvdFiles(avdFileNames, index + 1, cb);
      })
    });
  });
}

module.exports = {
  checkCommandLine,
  runCommand
};
