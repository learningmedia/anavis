module.exports = class PlaySoundHandler {
  constructor(appViewModel) {
    this.appViewModel = appViewModel;
  }

  onKeyDown() {}

  onKeyUp() {
    const firstPlayingController = this.getFirstPlayingSoundController()
    if (firstPlayingController) {
      firstPlayingController.onPauseClick();
      return;
    }

    const firstPlayableController = this.getFirstPlayableSoundControllerOfCurrentWork() || this.getFirstPlayableSoundController();
    if (firstPlayableController) {
      firstPlayableController.onStartClick();
    }
  }

  getFirstPlayingSoundController() {
    const allSoundControllers = Array.from(document.body.querySelectorAll('av-sound-player > div')).map(elem => ko.dataFor(elem));
    return allSoundControllers.filter(vm => vm.sound().state() === states.PLAYING)[0];
  }

  getFirstPlayableSoundControllerOfCurrentWork() {
    const currentWorkId = this.getCurrentWorkId();
    if (!currentWorkId) return undefined;
    const element = document.querySelector(`[data-work-id='${currentWorkId}']`);
    if (!element) return undefined;
    return this.getFirstPlayableSoundController(element);
  }

  getFirstPlayableSoundController(parentElement) {
    const allSoundControllers = Array.from((parentElement || document.body).querySelectorAll('av-sound-player > div')).map(elem => ko.dataFor(elem));
    return allSoundControllers.filter(vm => vm.sound().state() === states.STOPPED || vm.sound().state() === states.PAUSING)[0];
  }

  getCurrentWorkId() {
    const work = this.appViewModel.currentWork();
    return work ? work.id() : undefined;
  }
}
