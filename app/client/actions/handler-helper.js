const ko = require('knockout');
const states = require('../sound-controller-states');

function getFirstPlayingSoundController() {
  const allSoundControllers = Array.from(document.body.querySelectorAll('av-sound-player > div')).map(elem => ko.dataFor(elem));
  return allSoundControllers.filter(vm => vm.sound().state() === states.PLAYING)[0];
}

function getFirstPlayableSoundControllerOfCurrentWork(appViewModel) {
  const currentWorkId = getCurrentWorkId(appViewModel);
  if (!currentWorkId) return undefined;
  const element = document.querySelector(`[data-work-id='${currentWorkId}']`);
  if (!element) return undefined;
  return getFirstPlayableSoundController(element);
}

function getFirstPlayableSoundController(parentElement) {
  const allSoundControllers = Array.from((parentElement || document.body).querySelectorAll('av-sound-player > div')).map(elem => ko.dataFor(elem));
  return allSoundControllers.filter(vm => vm.sound().state() === states.STOPPED || vm.sound().state() === states.PAUSING)[0];
}

function getCurrentWorkId(appViewModel) {
  const work = appViewModel.currentWork();
  return work ? work.id() : undefined;
}

module.exports = {
  getCurrentWorkId,
  getFirstPlayableSoundController,
  getFirstPlayingSoundController,
  getFirstPlayableSoundControllerOfCurrentWork
};
