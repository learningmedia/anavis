const ko = require('knockout');
const states = require('../sound-controller-states');
const handlerHelper = require('./handler-helper');

module.exports = class PlaySoundHandler {
  constructor(appViewModel) {
    this.appViewModel = appViewModel;
  }

  onKeyDown() {}

  onKeyUp() {
    const firstPlayingController = handlerHelper.getFirstPlayingSoundController()
    if (firstPlayingController) {
      firstPlayingController.onPauseClick();
      return;
    }

    const firstPlayableController = handlerHelper.getFirstPlayableSoundControllerOfCurrentWork(this.appViewModel) || handlerHelper.getFirstPlayableSoundController();
    if (firstPlayableController) {
      firstPlayableController.onStartClick();
    }
  }
}
