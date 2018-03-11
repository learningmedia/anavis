const soundControllerStates = require('../sound-controller-states');

function getFirstPlayingSoundController(appViewModel) {
  const info = appViewModel.firstPlayingSoundInfo();
  return info ? info.sound._.controller() : undefined;
}

function getFirstPlayableSoundControllerOfCurrentWork(appViewModel) {
  const currentWork = appViewModel.currentWork();
  return currentWork ? getFirstPlayableSoundControllerOfWork(currentWork) : undefined;
}

function getFirstPlayableSoundController(appViewModel) {
  for (let work of appViewModel.works()) {
    const controller = getFirstPlayableSoundControllerOfWork(work);
    if (controller) return controller;
  }

  return undefined;
}

function getFirstPlayableSoundControllerOfWork(work) {
  const playableSound = work.sounds().find(s => [soundControllerStates.STOPPED, soundControllerStates.PAUSING].includes(s._.controller().state()));
  return playableSound ? playableSound._.controller() : undefined;
}

module.exports = {
  getFirstPlayingSoundController,
  getFirstPlayableSoundController,
  getFirstPlayableSoundControllerOfCurrentWork
};
