import ko from 'knockout';
import fs from 'fs';
import intempo from 'intempo';

import utils from '../utils';
import template from './sound-player.html';

function viewModel(params) {
  const sound = params.sound();
  const totalLength = ko.observable();
  const currentPosition = ko.observable();
  const state = ko.observable();
  let player;

  sound.path.subscribe(onSoundPathChanged);

  function onSoundPathChanged(newPath) {
    fs.readFile(newPath, onNewBuffer);
  }

  function onNewBuffer(err, buffer) {
    if (err) {
      console.error(err);
      return;
    }

    utils.blobToBuffer(new Blob([buffer]))
      .then(arrbuf => intempo.loadPlayer({
        arraybuffer: arrbuf,
        stateChangedCallback: state,
        positionChangedCallback: currentPosition
      }))
      .then(p => {
        player = p;
        totalLength(player.duration);
        player.start();
      })
      .catch(error => console.error(error));
  }

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
    viewModel: viewModel,
    template: template
  });
}

export default { register };
