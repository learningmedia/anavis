const partOperations = require('../bindings/part-operations');

module.exports = class CutWorkHandler {
  constructor(appViewModel) {
    this.appViewModel = appViewModel;
  }

  onKeyDown() {}

  onKeyUp() {
    const soundInfo = this.appViewModel.firstPlayingSoundInfo();
    if (!soundInfo) return;

    const controller = soundInfo.sound._.controller();
    const work = soundInfo.work;
    const factor = controller.position() / controller.length();
    const parts = work.parts();
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
    partOperations.splitPart(work, splitPartIndex, partSplitPoint);
  }
}
