import ko from 'knockout';
import utils from '../utils';
import template from './work.html';
import soundController from '../sound-controller';

function viewModel(params) {
  const app = params.app;
  const work = params.work;
  return {
    app: app,
    work: work,
    parts: work.parts,
    sound: work.sound,
    getContrastColor: utils.getContrastColor,
    onSoundDropped: files => {
      const ctrl = soundController.create(files[0].path);
      // TODO Stop old sound if exists!
      work.sound(ctrl);
    },
    onPartClicked: (part, event) => {
      app.currentPart(part);
      event.stopPropagation();
    }
  };
}

function register() {
  ko.components.register('av-work', {
    viewModel: viewModel,
    template: template
  });
}

export default { register };
