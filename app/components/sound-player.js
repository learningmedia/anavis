import ko from 'knockout';
import fs from 'fs';
import intempo from 'intempo';

import utils from '../utils';
import template from './sound-player.html';
import soundController from '../sound-controller';

function viewModel(params) {
  const sound = soundController.create(params.path);

  return {
    sound,
    onClick: function (vm, event) {
      const element = event.target;
      const elementWidth = element.clientWidth;
      const clickPositionX = event.pageX - element.offsetLeft;
      const clickPercent = clickPositionX / elementWidth;
      sound.start(clickPercent * sound.length());
    }
  };
}

function register() {
  // Register the sound player as a new knockout component:
  ko.components.register('av-sound-player', {
    viewModel: viewModel,
    template: template
  });
}

export default { register };
