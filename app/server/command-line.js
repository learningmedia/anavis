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
  }
}

function doEject(args, cb) {
  if (!args.length) {
    return cb(new Error('No file name specified'));
  }

  docLoader.openDocument(args[0], (err, doc, unzipDir) => {
    if (err) return cb(err);

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(doc, null, 2));

    rimraf(unzipDir, err2 => {
      if (err2) return cb(err2);
      cb(null);
    })
  });
}

module.exports = {
  checkCommandLine,
  runCommand
};
