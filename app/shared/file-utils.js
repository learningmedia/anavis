const path = require('path');
const { app, remote } = require('electron');
const isRenderer = require('is-electron-renderer');

function createTempDirectoryName() {
  const theApp = isRenderer ? remote.app : app;
  const userDataDir = theApp.getPath('userData');
  return path.join(userDataDir, 'temp-docs', `doc_${Date.now()}`);
}

module.exports = {
  createTempDirectoryName
};
