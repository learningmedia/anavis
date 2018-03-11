const handlerHelper = require('./handler-helper');

module.exports = class PlaySoundHandler {
  constructor(appViewModel) {
    this.appViewModel = appViewModel;
  }

  onKeyDown() {}

  onKeyUp() {
    const firstPlayingController = handlerHelper.getFirstPlayingSoundController(this.appViewModel)
    if (firstPlayingController) {
      firstPlayingController.pause();
      return;
    }

    const firstPlayableController = handlerHelper.getFirstPlayableSoundControllerOfCurrentWork(this.appViewModel) || handlerHelper.getFirstPlayableSoundController(this.appViewModel);
    if (firstPlayableController) {
      firstPlayableController.start();
    }
  }
}
