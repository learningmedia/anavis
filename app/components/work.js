import ko from 'knockout';
import utils from '../utils';
import template from './work.html';

function viewModel(params) {
  const app = params.app;
  const work = params.work;
  return {
    app: app,
    parts: work.parts,
    sound: work.sound,
    getContrastColor: utils.getContrastColor,
    onSoundDropped: files => work.sound().path(files[0].path),
    onPartClicked: part => app.currentPart(part)
  };
}

function register() {
  ko.components.register('av-work', {
    viewModel: viewModel,
    template: template
  });
}

export default { register };
