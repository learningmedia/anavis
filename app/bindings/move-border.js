import ko from 'knockout';

const TOUCH_TOLERANCE_IN_PIXELS = 24;

// AVU == AnaVis Units

function getAdjacentParts(work, touchOffsetInPixels, totalWorkWidthInPixels) {
  const totalParts = work.parts().length;
  const totalWorkLengthInAvus = work.parts().reduce((sum, currentPart) => sum + currentPart.length(), 0);
  const avusPerPixel = totalWorkLengthInAvus / totalWorkWidthInPixels;
  const currentTouchPointInOurLengthUnit = touchOffsetInPixels * avusPerPixel;
  const touchToleranceInAvus = TOUCH_TOLERANCE_IN_PIXELS * avusPerPixel;
  for (let currentLeftPartIndex = 0, currentBorderOffsetInAvus = 0; currentLeftPartIndex < totalParts - 1; currentLeftPartIndex += 1) {
    const currentLeftPart = work.parts()[currentLeftPartIndex];
    currentBorderOffsetInAvus += currentLeftPart.length();
    const minTouchOffsetInAvus = currentBorderOffsetInAvus - (touchToleranceInAvus / 2);
    const maxTouchOffsetInAvus = currentBorderOffsetInAvus + (touchToleranceInAvus / 2);
    if (currentTouchPointInOurLengthUnit >= minTouchOffsetInAvus && currentTouchPointInOurLengthUnit <= maxTouchOffsetInAvus) {
      return { leftIndex: currentLeftPartIndex, rightIndex: currentLeftPartIndex + 1 };
    }
  }
  return undefined;
}

function register() {
  ko.bindingHandlers.moveBorder = {
    init: function (element, valueAccessor) {
      const value = valueAccessor();
      const work = value.work;
      element.addEventListener('mousedown', onMouseDown);
      function onMouseDown(event) {
        const totalWorkWidth = element.clientWidth;
        const touchPoint = event.clientX - element.offsetLeft;
        const adjacentParts = getAdjacentParts(work, touchPoint, totalWorkWidth);
        console.log(`Treffer: ${JSON.stringify(adjacentParts)}`)
        if (adjacentParts) {
          event.stopPropagation();
        }
      }
    }
  };
}

export default { register };
