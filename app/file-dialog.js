import mockViewModel from './mock-view-model';
import folderZip from './common/folder-zip';
import { remote } from 'electron';
import koMapping from 'knockout-mapping';
import path from 'path';
import fs from 'fs';

function open() {
  remote.dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'AnaVis document', extensions: ['avd'] }] }, function (filenames) {
    if (filenames && filenames.length) {
      openDocument(filenames[0], function (error, doc) {
        const workVm = createWorkViewModelFromDocunment(doc);
        mockViewModel.works.push(workVm);
        console.log('It is pushed!');
      })
    }
  });
}

function openDocument(filename, cb) {
  const userDataDir = remote.app.getPath('userData');
  const unzipDir = path.join(userDataDir, `doc_${Date.now()}`);
  console.log('unzipDir', unzipDir);
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
  return koMapping.fromJS(doc);
}

export default { open };
