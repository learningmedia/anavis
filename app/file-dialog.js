import appViewModel from './app-view-model';
import folderZip from './common/folder-zip';
import { remote } from 'electron';
import koMapping from 'knockout-mapping';
import BigNumber from 'bignumber.js';
import path from 'path';
import fs from 'fs';

function open() {
  remote.dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'AnaVis document', extensions: ['avd'] }] }, function (filenames) {
    if (filenames && filenames.length) {
      const userDataDir = remote.app.getPath('userData');
      const unzipDir = path.join(userDataDir, `doc_${Date.now()}`);
      openDocument(filenames[0], unzipDir, function (error, doc) {
        const workVm = createWorkViewModelFromDocunment(doc);
        workVm._ = {
          zipFileName: filenames[0],
          workingDirectory: unzipDir
        };
        appViewModel.works.push(workVm);
      })
    }
  });
}

function openDocument(filename, unzipDir, cb) {
  folderZip.unzip(filename, unzipDir, function (err) {
    if (err) return cb && cb(err);
    const docFileName = path.join(unzipDir, 'anavis.json');
    fs.readFile(docFileName, 'utf8', function (err, content) {
      if (err) return cb && cb(err);
      return cb && cb(null, JSON.parse(content));
    });
  });
}

function createWorkViewModelFromDocunment(doc) {
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

export default { open };
