import ko from "knockout";
import intempo from "learningmedia/intempojs";

const AudioContext = window.AudioContext || window.webkitAudioContext;
const fetch = window.fetch;
const audioContext = new AudioContext();

function calculateRelativePosition(event) {
  const element = event.target;
  const offsetLeft = event.pageX - element.offsetLeft;
  return offsetLeft / element.scrollWidth;
}

function createViewModel(path) {
  let player;

  const vm = {};
  vm.state = ko.observable("LOADING");
  vm.currentPosition = ko.observable(0);
  vm.totalLength = ko.observable(0);
  vm.onClick = onClick;
  vm.stop = stop;
  vm.pause = pause;

  function onStateChanged(state) {
    vm.state(state);
  }

  function onPositionChanged(position) {
    vm.currentPosition(position);
  }

  function onClick(viewModel, event) {
    if (player) {
      const relativePosition = calculateRelativePosition(event);
      player.start(relativePosition * vm.totalLength());
    }
  }

  function stop() {
    if (player) {
      player.stop();
    }
  }

  function pause() {
    if (player) {
      player.pause();
    }
  }

  fetch(path)
    .then(response => response.arrayBuffer())
    .then(buffer => intempo.loadPlayer({
      arraybuffer: buffer,
      audioContext: audioContext,
      stateChangedCallback: onStateChanged,
      positionChangedCallback: onPositionChanged,
      clockInterval: 50
    }))
    .then(p => {
      player = p;
      vm.totalLength(player.duration);
      vm.state(p.state);
    })
    .catch(() => vm.state("ERROR"));

  return vm;
}

export default { createViewModel };
