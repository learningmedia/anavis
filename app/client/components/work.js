const fs = require('fs');
const ko = require('knockout');

const utils = require('../utils');

const template = fs.readFileSync(`${__dirname}/work.html`, 'utf8');

function viewModel(params) {
  const app = params.app;
  const work = params.work;
  return {
    app: app,
    work: work,
    parts: work.parts,
    sounds: work.sounds,
    getContrastColor: utils.getContrastColor,
    onSoundDropped: files => work.sounds.push.apply(work.sounds, files.map(f => f.path))
  };
}

function register() {
  ko.components.register('av-work', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
