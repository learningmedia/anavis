const path = require('path');
const color = require('color');
const { remote } = require('electron');


function getContrastColor(col) {
  return color(col).light() ? '#000' : '#FFF';
}

function blobToBuffer(blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = function () {
      if (fileReader.error) {
        reject(fileReader.error);
      } else {
        resolve(fileReader.result);
      }
    };
    fileReader.readAsArrayBuffer(blob);
  });
}

function createTempDirectoryName() {
  const userDataDir = remote.app.getPath('userData');
  return path.join(userDataDir, 'temp-docs', `doc_${Date.now()}`);
}

module.exports = {
  createTempDirectoryName,
  getContrastColor,
  blobToBuffer
};
