const fs = require('fs');
const ko = require('knockout');

const template = fs.readFileSync(`${__dirname}/work.html`, 'utf8');

function viewModel(params) {
  const app = params.app;
  const work = params.work;
  return {
    app: app,
    work: work,
    parts: work.parts,
    annotations: work.annotations,
    sounds: work.sounds,
    onSoundDropped: files => work.sounds.push.apply(work.sounds, files.map(f => ({ path: ko.observable(f.path), embedded: ko.observable(false) })))
  };
}

function register() {
  ko.components.register('av-work', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
