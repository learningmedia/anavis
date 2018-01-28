const fs = require('fs');
const ko = require('knockout');
const utils = require('./utils');
const intempo = require('intempo');
const states = require('./sound-controller-states');

function create(path, id) {
  let player;
  const vm = {};
  vm.id = ko.observable(id || Date.now().toString());
  vm.path = ko.observable(path);
  vm.length = ko.observable(0);
  vm.position = ko.observable(0);
  vm.state = ko.observable(states.LOADING);
  vm.isLoading = ko.computed(() => vm.state() === states.LOADING);
  vm.hasError = ko.computed(() => vm.state() === states.ERROR);
  vm.isReady = ko.computed(() => !vm.isLoading() && !vm.hasError());
  vm.start = function (position) {
    if (player) {
      player.start(position || 0);
    }
  };
  vm.pause = function () {
    if (player) {
      player.pause();
    }
  };
  vm.stop = function () {
    if (player) {
      player.stop();
    }
  };

  // Load the sound:
  vm.state(states.LOADING);
  fs.readFile(vm.path(), onNewBuffer);

  function onIntempoStateChanged(newState) {
    switch (newState) {
      case intempo.STATE_STOPPED:
        vm.state(states.STOPPED);
        break;
      case intempo.STATE_PLAYING:
        vm.state(states.PLAYING);
        break;
      case intempo.STATE_PAUSING:
        vm.state(states.PAUSING);
        break;
      default:
        console.error(`Unknown Intempo state: ${newState}`);
        vm.state(states.ERROR);
        break;
    }
  }

  function onNewBuffer(err, buffer) {
    if (err) {
      console.error(err);
      vm.state(states.ERROR);
      return;
    }

    utils.blobToBuffer(new Blob([buffer]))
      .then(arrbuf => intempo.loadPlayer({
        arraybuffer: arrbuf,
        stateChangedCallback: onIntempoStateChanged,
        positionChangedCallback: vm.position
      }))
      .then(p => {
        player = p;
        vm.length(player.duration);
        vm.state(states.STOPPED)
      })
      .catch(error => {
        console.error(error);
        vm.state(states.ERROR)
      });
  }

  return vm;
}

module.exports = { create, states };
