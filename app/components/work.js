import ko from 'knockout';
import utils from '../utils';
import template from './work.html';

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

export default { register };
