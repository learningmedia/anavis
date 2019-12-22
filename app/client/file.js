const fs = require('fs');
const path = require('path');
const ko = require('knockout');
const async = require('async');
const mkdirp = require('mkdirp');
const { remote } = require('electron');
const BigNumber = require('bignumber.js');
const koMapping = require('knockout-mapping');
const workSelector = require('./components/work-selector');
const appViewModel = require('./app-view-model');
const defaultDocument = require('./default-document');
const soundController = require('./sound-controller');
const fileUtils = require('../shared/file-utils');
const folderZip = require('../shared/folder-zip');
const docLoader = require('../shared/doc-loader');
const Messenger = require('../shared/messenger');
const events = require('../shared/events');
const config = require('../shared/config');

function create() {
  const unzipDir = fileUtils.createTempDirectoryName();
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

function openSingle(path) {
  openDocument(path, function (error, doc, unzipDir) {
    openWork(doc, unzipDir, path);
  });
}

function openAll(paths) {
  paths.forEach(path => openSingle(path));
}

function openWork(doc, unzipDir, zipFileName) {
  doc.sounds.forEach(s => {
    if (s.embedded) s.path = path.resolve(unzipDir, s.path);
    else s.path = path.resolve(path.dirname(zipFileName), s.path);
  });
  const workVm = createWorkViewModelFromDocument(doc);
  workVm._ = {
    zipFileName: ko.observable(zipFileName),
    workingDirectory: ko.observable(unzipDir),
    isDirty: ko.observable(false)
  };
  workVm._.isDirty.silent = false;
  ko.computed(() => ko.toJS(workVm)).subscribe(() => {
    if (!workVm._.isDirty.silent) workVm._.isDirty(true);
  });
  workVm.sounds().forEach(s => {
    s._ = {
      controller: ko.observable(soundController.create(s.path()))
    };
  })
  appViewModel.works.push(workVm);
  if (zipFileName) {
    config.pushValue('recentUsedFiles', zipFileName);
  }
}

function save(cb) {
  if (appViewModel.works().length === 0) {
    return cb && cb();
  }
  if (appViewModel.works().length === 1) {
    return saveWork(appViewModel.works()[0], cb);
  }
  saveAll(cb);
}

function saveAll(cb) {
  const workInfos = appViewModel.works().map(work => ({
    id: work.id(),
    name: work.name() + (work._.zipFileName() ? ` - ${work._.zipFileName()}` : ''),
    isDirty: work._.isDirty()
  }));

  if (workInfos.length && workInfos.some(info => info.isDirty)) {
    workSelector.show({
      workInfos: workInfos,
      callback: workIdsToSave => {
        if (!workIdsToSave) return cb && cb(false);
        const worksToSave = appViewModel.works().filter(work => workIdsToSave.includes(work.id()));
        return saveWorks(worksToSave, () => cb && cb(true));
      }
    });
  } else {
    async.nextTick(() => cb && cb(true));
  }
}

function saveWorks(works, cb) {
  if (!works) return cb && cb();
  return async.series(works.map(work => saveWork.bind(null, work)), cb);
}

function saveWork(work, cb) {
  if (!work) return cb && cb();
  if (!work._.zipFileName()) {
    remote.dialog.showSaveDialog({ properties: ['saveFile'], filters: [{ name: 'AnaVis document', extensions: ['avd'] }] }, function (fileName) {
      if (fileName) {
        work._.zipFileName(fileName);
        saveWork(work, cb);
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
      delete s['_'];
      if (s.embedded) s.path = path.relative(workingDirectory, s.path);
      else s.path = path.relative(path.dirname(zipFileName), s.path);
    });
    fs.writeFile(docFileName, JSON.stringify(workJson), 'utf8', err => {
      if (err) return cb && cb(err);
      folderZip.zip(workingDirectory, zipFileName, err2 => {
        if (err2) return cb && cb(err2);
        work._.isDirty.silent = true;
        work._.isDirty(false);
        work._.isDirty.silent = false;
        config.pushValue('recentUsedFiles', zipFileName);
        return cb && cb();
      });
    });
  }
}

function close(workToClose) {
  const work = workToClose || appViewModel.currentWork();
  if (!work) return;
  if (work._.isDirty()) {
    const msgBoxOptions = {
      title: 'Speichern',
      text: 'Das Dokument wurde geändert. Möchten Sie die Änderungen vor dem Schließen speichern?',
      buttons: [{
        label: 'Ja',
        value: 'yes',
        isDefault: true
      }, {
        label: 'Nein',
        value: 'no'
      }, {
        label: 'Abbrechen',
        value: 'cancel'
      }]
    };
    Messenger.mainWindowInstance.send(events.OPEN_MESSAGE_BOX, msgBoxOptions).then(msgBoxResult => {
      switch (msgBoxResult) {
        case 'yes':
          saveWork(work, () => {
            appViewModel.works.remove(work);
          });
          break;
        case 'no':
          appViewModel.works.remove(work);
          break;
        case 'cancel':
          break;
        default:
          throw new Error('msgBoxResult');
      }
    });
  } else {
    appViewModel.works.remove(work);
  }
}

function openDocument(avdFileName, cb) {
  return docLoader.openDocument(avdFileName, cb);
}

function readDocument(unzipDir, cb) {
  return docLoader.readDocument(unzipDir, cb);
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

module.exports = { create, open, openSingle, openAll, save, saveAll, close };
