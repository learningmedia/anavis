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
    const lengthOfParts = this.appViewModel.currentWork().parts().reduce((sum, part) => {
      return sum + part.length();
    }, 0);
    const firstPlayingController = handlerHelper.getFirstPlayingSoundController()
    if (firstPlayingController) {
      const factor = firstPlayingController.sound().position() / firstPlayingController.sound().length();
      const splitPoint = lengthOfParts * factor;

      const parts = this.appViewModel.currentWork().parts();
      if(splitPoint < parts[0].length()) {
        partOperations.splitPart(this.appViewModel.currentWork(), 0, splitPoint);
      }
      // let index = 1;
      // let currentPartsLength = 0;
      // let lookUp = 0;
      // for (var i = 1; i < parts.length; i++) {

      // }
      // let part = parts[index];
      // let partSplitPoint = splitPoint - currentPartsLength;
      // let s = `Index: ${index}, CurrentPartsLength: ${currentPartsLength}, partSplitPoint: ${partSplitPoint}`;
      // console.log(s);
      // partOperations.splitPart(this.appViewModel.currentWork(), index, partSplitPoint);
      return;
    }

    const firstPlayableController = handlerHelper.getFirstPlayableSoundControllerOfCurrentWork() || handlerHelper.getFirstPlayableSoundController(handlerHelper.getCurrentWorkId(this.appViewModel));
    if (firstPlayableController) {
      console.log(firstPlayableController.sound().position());
      // console.log(this.appViewModel.currentWork().parts().reduce((acc, cv) => {
      //   acc + cv;
      // }));
    }
  }
}
// splitPart(work, partIndex, splitPoint)
// mergeParts(work, leftIndex, rightIndex)
// clonePart(part)
