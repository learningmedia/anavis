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
    parts: params.parts,
    onProgressClick: function (vm, event) {
      let playPercent;
      let playAvu;
      const element = event.target;
      const elementWidth = element.clientWidth;
      const clickPositionX = event.pageX - (element.getBoundingClientRect().left - window.scrollX);
      playPercent = clickPositionX / elementWidth;
      if (!event.ctrlKey) {
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
      sound.start(playPercent * sound.length());
    },
    onStartClick: function () {
      sound.start();
    },
    onStopClick: function () {
      sound.stop();
    },
    onPauseClick: function () {
      sound.pause();
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
