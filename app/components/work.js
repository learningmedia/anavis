import ko from 'knockout';
import utils from '../utils';
import template from './work.html';

function viewModel(params) {
  const work = params.work;
  return {
    parts: work.parts,
    sound: work.sound,
    getContrastColor: utils.getContrastColor,
    onSoundDropped: files => work.sound().path(files[0].path)
  };
}

function register() {
  ko.components.register('av-work', {
    viewModel: viewModel,
    template: template
  });
}

export default { register };
