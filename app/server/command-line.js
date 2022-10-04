const fs = require('fs');
const path = require('path');
const glob = require('glob');
const rimraf = require('rimraf');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const docLoader = require('../shared/doc-loader');
const { stringify: csvStringify } = require('csv-stringify/dist/cjs/sync.cjs');

function checkCommandLine() {
  const cliArgs = yargs(hideBin(process.argv))
    .command({
      command: 'eject',
      describe: 'Export one or multiple AnaVis files to JSON or CSV',
      builder: yargs => yargs
        .option('directory', { alias: 'd', demandOption: false, type: 'string' })
        .option('format', { alias: 'f', demandOption: true, type: 'string', default: 'json' }),
      handler: argv => {
        argv.command = 'eject';
        argv.args = {
          directory: argv.directory,
          format: argv.format === 'csv' ? 'csv' : 'json',
          files: argv._.filter(arg => arg !== 'eject')
        }
      }
    })
    .help()
    .argv;

    return cliArgs.command ? cliArgs : null;
}

function runCommand(cliArgs, cb) {
  switch (cliArgs.command) {
    case 'eject':
      doEject(cliArgs.args, cb);
      break;
    default:
      cb(new Error(`Invalid command name: ${cliArgs.command}`));
      break;
  }
}

function doEject(args, cb) {
  if (!args.directory && !args.files) {
    return cb(new Error('No file name specified'));
  }

  const collectFiles = args.directory
    ? func => glob(path.join(args.directory, '*.avd'), func)
    : func => func(null, args.files);

  collectFiles((err, files) => {
    if (err) cb(err);

    if (!files || !files.length) {
      // eslint-disable-next-line no-console
      console.log(`No AnaVis files found in directory ${args.directory}`);
    }

    ejectAvdFiles(files, 0, args.format, cb);
  });
}

function doc2Csv(doc) {
  const sumPartLengths = parts => parts.reduce((accu, part) => accu + part.length, 0);

  const totalLength = sumPartLengths(doc.parts);

  const segments = doc.parts.map((part, index) => ({
    startPosition: sumPartLengths(doc.parts.slice(0, index)) / totalLength,
    title: part.name,
    color: part.color,
    text: doc.annotations.map(annotation => annotation.values[index]).filter(text => text).join('\n\n') || ''
  }));

  return csvStringify(segments, { header: true });
}

function ejectAvdFiles(avdFileNames, index, format, cb) {
  const avdFileName = avdFileNames[index];
  if (!avdFileName) return cb();

  const outputFileName = `${avdFileName}.${format}`;

  // eslint-disable-next-line no-console
  console.log(`Ejecting: ${avdFileName} -> ${outputFileName}`);

  docLoader.openDocument(avdFileName, (err1, doc, unzipDir) => {
    if (err1) return cb(err1);

    const content = format === 'json'
      ? JSON.stringify(doc, null, 2)
      : doc2Csv(doc);

    fs.writeFile(outputFileName, content, 'utf8', err2 => {
      if (err2) return cb(err2);

      rimraf(unzipDir, err3 => {
        return err3 ? cb(err3) : ejectAvdFiles(avdFileNames, index + 1, format, cb);
      })
    });
  });
}

module.exports = {
  checkCommandLine,
  runCommand
};
