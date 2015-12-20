import ko from 'knockout';
import template from './sound-player.html';
import intempo from 'intempo';

function createSoundPlayerViewModel(params) {
  const sound = params.sound();
  const totalLength = ko.observable();
  const currentPosition = ko.observable();
  const state = ko.observable();
  let player;

  intempo.loadPlayer({
      arraybuffer: sound.buffer,
      stateChangedCallback: state,
      positionChangedCallback: currentPosition
    })
    .then(p => {
      player = p;
      totalLength(player.duration);
      player.start();
    })
    .catch(error => console.error(error));

  return {
    totalLength,
    currentPosition,
    state,
    onClick: function (vm, event) {
      const element = event.target;
      const elementWidth = element.clientWidth;
      const clickPositionX = event.pageX - element.offsetLeft;
      const clickPercent = clickPositionX / elementWidth;
      player.start(clickPercent * totalLength());
    }
  };
}

function register() {
  // Register the sound player as a new knockout component:
  ko.components.register('av-sound-player', {
    viewModel: createSoundPlayerViewModel,
    template: template
  });
}

export default { register };
