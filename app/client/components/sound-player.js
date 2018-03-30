const fs = require('fs');
const path = require('path');
const ko = require('knockout');
const { remote } = require('electron');
const soundController = require('../sound-controller');
const platformHelper = require('../common/platform-helper');

const template = fs.readFileSync(`${__dirname}/sound-player.html`, 'utf8');

function viewModel(params) {
  const sound = params.sound._.controller;

  return {
    sound,
    parts: params.work.parts,
    embedded: params.sound.embedded,
    onProgressClick: function (vm, event) {
      let playPercent;
      const element = event.target;
      const elementWidth = element.clientWidth;
      const clickPositionX = event.pageX - (element.getBoundingClientRect().left - window.scrollX);
      playPercent = clickPositionX / elementWidth;
      if (!platformHelper.isCtrlOrCmdPressed(event)) {
        const parts = vm.parts();
        const totalLengthInAvu = parts.reduce((sum, part) => sum + part.length(), 0);
        const clickAvu = totalLengthInAvu * playPercent;
        var partBeginInAvu = 0;
        for (var i = 0; i < parts.length; i++) {
          if ((partBeginInAvu + parts[i].length()) >= clickAvu) {
            break;
          }
          partBeginInAvu += parts[i].length();
        }
        playPercent = partBeginInAvu / totalLengthInAvu;
      }
      sound().start(playPercent * sound().length());
    },
    onStartClick: function () {
      sound().start();
    },
    onStopClick: function () {
      sound().stop();
    },
    onPauseClick: function () {
      sound().pause();
    },
    onEmbedClick: function () {
      const directoryName = params.work._.workingDirectory();
      const fileName = path.basename(params.sound.path());
      const destinationFileName = path.join(directoryName, fileName);
      copyFileSync(params.sound.path(), destinationFileName);
      params.sound.path(destinationFileName);
      params.sound.embedded(true);
      sound(soundController.create(params.sound.path()));
    },
    onExtractClick: function () {
      const extension = path.extname(params.sound.path()).replace(/^\.*/, '');
      const filename = path.basename(params.sound.path());
      const suggestedPath = path.join(remote.app.getPath('desktop'), filename);
      const options = {
        properties: ['saveFile'],
        defaultPath: suggestedPath,
        filters: [{ name: 'Sound file', extensions: [extension] }]
      };
      remote.dialog.showSaveDialog(options, function (destinationFileName) {
        if (destinationFileName) {
          const sourceFileName = params.sound.path();
          copyFileSync(sourceFileName, destinationFileName);
          params.sound.path(destinationFileName);
          params.sound.embedded(false);
          sound(soundController.create(params.sound.path()));
          fs.unlinkSync(sourceFileName);
        }
      });
    },
    onDeleteClick: () => deleteSound(params.work, params.sound),
    dispose: function () {
      sound().stop();
    }
  };
}

function deleteSound(work, sound){
  work.sounds.remove(sound);
}

function copyFileSync(srcFile, destFile) {
  const BUF_LENGTH = 64 * 1024;
  const buff = new Buffer(BUF_LENGTH);
  const fdr = fs.openSync(srcFile, 'r');
  const fdw = fs.openSync(destFile, 'w');
  let bytesRead = 1;
  let pos = 0;
  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  fs.closeSync(fdw);
}

function register() {
  // Register the sound player as a new knockout component:
  ko.components.register('av-sound-player', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
