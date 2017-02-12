const fs = require('fs');
const path = require('path');
const ko = require('knockout');
const mkdirp = require('mkdirp');
const { remote } = require('electron');
const BigNumber = require('bignumber.js');
const koMapping = require('knockout-mapping');

const utils = require('./utils');
const folderZip = require('./common/folder-zip');
const appViewModel = require('./app-view-model');
const defaultDocument = require('./default-document');
const avdReader = require('./mappings/avd-reader');

function create() {
  const unzipDir = utils.createTempDirectoryName();
  mkdirp.sync(unzipDir);
  const content = JSON.stringify(defaultDocument.create());
  fs.writeFileSync(path.join(unzipDir, 'anavis.json'), content, 'utf8');
  readDocument(unzipDir, function (error, doc) {
    openWork(doc, unzipDir, undefined);
  });
}

function open() {
  remote.dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'AnaVis document', extensions: ['avd'] }] }, function (filenames) {
    if (filenames && filenames.length) {
      if (appViewModel.works().some(x => x._.zipFileName() === filenames[0])) return;
      const zipFileName = filenames[0];
      openDocument(zipFileName, function (error, doc, unzipDir) {
        openWork(doc, unzipDir, zipFileName);
      });
    }
  });
}

function openWork(doc, unzipDir, zipFileName) {
  doc.sounds.forEach(s => {
    if (s.embedded) s.path = path.resolve(unzipDir, s.path);
    else s.path = path.resolve(path.dirname(zipFileName), s.path);
  });
  const workVm = createWorkViewModelFromDocument(doc);
  workVm._ = {
    zipFileName: ko.observable(zipFileName),
    workingDirectory: ko.observable(unzipDir)
  };
  appViewModel.works.push(workVm);
}

function save(cb) {
  const work = appViewModel.currentWork();
  if (!work) return cb && cb();
  if (!work._.zipFileName()) {
    remote.dialog.showSaveDialog({ properties: ['saveFile'], filters: [{ name: 'AnaVis document', extensions: ['avd'] }] }, function (fileName) {
      if (fileName) {
        work._.zipFileName(fileName);
        save(cb);
      } else {
        return cb && cb();
      }
    });
  } else {
    const zipFileName = work._.zipFileName();
    const workingDirectory = work._.workingDirectory();
    const docFileName = path.normalize(path.join(workingDirectory, 'anavis.json'));
    const workJson = JSON.parse(ko.toJSON(work));
    delete workJson['_'];
    workJson.sounds.forEach(s => {
      if (s.embedded) s.path = path.relative(workingDirectory, s.path);
      else s.path = path.relative(path.dirname(zipFileName), s.path);
    });
    fs.writeFile(docFileName, JSON.stringify(workJson), 'utf8', err => {
      if (err) return cb && cb(err);
      folderZip.zip(workingDirectory, zipFileName, cb);
    });
  }
}

function close() {
  const work = appViewModel.currentWork();
  if (work) {
    appViewModel.works.remove(work);
  }
}

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

function createWorkViewModelFromDocument(doc) {
  consolidatePartLengths(doc);
  const workVm = koMapping.fromJS(doc);
  delete workVm['__ko_mapping__'];
  return workVm;
}

function consolidatePartLengths(doc) {
  const maxSum = 1000000;
  const sum = doc.parts.reduce((accu, part) => accu.plus(part.length.toString()), new BigNumber(0));
  const factor = new BigNumber(maxSum).dividedBy(sum).toNumber();
  doc.parts.forEach(part => { part.length *= factor; });
  return doc;
}

module.exports = { create, open, save, close };
