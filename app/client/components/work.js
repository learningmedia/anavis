const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const ko = require('knockout');
const { remote } = require('electron');
const file = require('../file');
const systemSounds = require('../system-sounds');
const soundController = require('../sound-controller');
const autoColorizer = require('../actions/auto-colorizer');

const template = fs.readFileSync(`${__dirname}/work.html`, 'utf8');

const allowedSoundExtensions = ['.mp3', '.ogg', '.wav', '.flac'];

function viewModel(params) {
  const app = params.app;
  const work = params.work;
  const vm = {
    app: app,
    work: work,
    parts: work.parts,
    annotations: work.annotations,
    sounds: work.sounds,
    addSound: () => {
      openSoundDialog(fileNames => {
        fileNames.forEach(fileName => vm.work.sounds.push({
          path: ko.observable(fileName),
          embedded: ko.observable(false)
        }));
      });
    },
    addAnnotation: () => {
      vm.work.annotations.push({
        id: ko.observable(uuid.v4()),
        type: ko.observable('lyrics'),
        values: ko.observableArray(vm.parts().map(() => ko.observable('')))
      });
    },
    autoColorize: () => {
      autoColorizer.colorize(vm.work);
    },
    onSoundDropped: files => {
      const filePaths = files.map(f => f.path);
      const extensions = filePaths.map(p => (path.extname(p) || '').toLowerCase());
      if (extensions.some(ext => !allowedSoundExtensions.includes(ext))) return systemSounds.beep();
      vm.work.sounds.push.apply(vm.work.sounds, filePaths.map(p => createSound(p)));
    },
    onClose: () => {
      file.close(vm.work);
    }
  };

  return vm;
}

function createSound(path) {
  return {
    path: ko.observable(path),
    embedded: ko.observable(false),
    _: {
      controller: ko.observable(soundController.create(path))
    }
  };
}

function openSoundDialog(cb) {
  const filters = [{
    name: 'Sound file',
    extensions: allowedSoundExtensions.map(ext => ext.replace(/^\./, ''))
  }];
  remote.dialog.showOpenDialog({ properties: ['openFile', 'dontAddToRecent'], filters: filters })
    .then(({ filePaths }) => {
      return filePaths && filePaths.length && cb && cb(filePaths);
    });
}

function register() {
  ko.components.register('av-work', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
