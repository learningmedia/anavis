const ko = require('knockout');
const states = require('../sound-controller-states');
const handlerHelper = require('./handler-helper');
const partOperations = require('../bindings/part-operations');


module.exports = class CutWorkHandler {
  constructor(appViewModel) {
    this.appViewModel = appViewModel;
  }

  onKeyDown() {}

  onKeyUp() {
    const firstPlayingController = handlerHelper.getFirstPlayingSoundController();
    const currentWork = this.appViewModel.currentWork();
    if (!firstPlayingController || !currentWork) return;

    const workIndex = this.appViewModel.works().indexOf(currentWork);
    const factor = firstPlayingController.sound().position() / firstPlayingController.sound().length();
    const parts = this.appViewModel.currentWork().parts();
    const lengthOfParts = parts.reduce((sum, part) => {
      return sum + part.length();
    }, 0);
    const splitPoint = lengthOfParts * factor;

    let splitPartIndex = 0;
    let lengthOfPartsWithoutSplitPart = 0;
    let lengthOfCurrentPart = 0;

    for (let i = 0; i < parts.length; i++) {
      lengthOfCurrentPart = parts[i].length();
      splitPartIndex = i;
      if (lengthOfPartsWithoutSplitPart + lengthOfCurrentPart > splitPoint) break;
      lengthOfPartsWithoutSplitPart += lengthOfCurrentPart;
    }

    let partSplitPoint = splitPoint - lengthOfPartsWithoutSplitPart;
    partOperations.splitPart(this.appViewModel.currentWork(), splitPartIndex, partSplitPoint);
    this.appViewModel.currentPart(this.appViewModel.works()[workIndex].parts()[splitPartIndex + 1]);
  }
}
