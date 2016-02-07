import ko from 'knockout';

const TOUCH_TOLERANCE_IN_PIXELS = 12;

// AVU == AnaVis Units

function registerEventListenerWithTeardown(element, event, handler) {
  element.addEventListener(event, handler);
  ko.utils.domNodeDisposal.addDisposeCallback(element, () => element.removeEventListener(event, handler));
}

function getAdjacentParts(work, touchOffsetInAvus, touchToleranceInAvus) {
  const totalParts = work.parts().length;
  for (let currentLeftPartIndex = 0, currentBorderOffsetInAvus = 0; currentLeftPartIndex < totalParts - 1; currentLeftPartIndex += 1) {
    const currentLeftPart = work.parts()[currentLeftPartIndex];
    currentBorderOffsetInAvus += currentLeftPart.length();
    const minTouchOffsetInAvus = currentBorderOffsetInAvus - touchToleranceInAvus;
    const maxTouchOffsetInAvus = currentBorderOffsetInAvus + touchToleranceInAvus;
    if (touchOffsetInAvus >= minTouchOffsetInAvus && touchOffsetInAvus <= maxTouchOffsetInAvus) {
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
      registerEventListenerWithTeardown(element, 'mousedown', onMouseDown);
      registerEventListenerWithTeardown(element, 'mouseup', onMouseUpOrLeave);
      registerEventListenerWithTeardown(element, 'mouseleave', onMouseUpOrLeave);
      registerEventListenerWithTeardown(element, 'mousemove', onMouseMove);
      let currentProcess = null;
      function onMouseDown(event) {
        const totalWorkLengthInPixels = element.clientWidth;
        const touchOffsetInPixels = event.clientX - element.offsetLeft;
        const totalParts = work.parts().length;
        const totalWorkLengthInAvus = work.parts().reduce((sum, currentPart) => sum + currentPart.length(), 0);
        const avusPerPixel = totalWorkLengthInAvus / totalWorkLengthInPixels;
        const touchOffsetInAvus = touchOffsetInPixels * avusPerPixel;
        const touchToleranceInAvus = TOUCH_TOLERANCE_IN_PIXELS * avusPerPixel;
        const adjacentParts = getAdjacentParts(work, touchOffsetInAvus, touchToleranceInAvus);
        if (adjacentParts) {
          currentProcess = {
            initialTouchOffsetInAvus: touchOffsetInAvus,
            leftIndex: adjacentParts.leftIndex,
            rightIndex: adjacentParts.rightIndex,
            initalLeftPartLengthInAvus: work.parts()[adjacentParts.leftIndex].length(),
            initalRightPartLengthInAvus: work.parts()[adjacentParts.rightIndex].length(),
            avusPerPixel: avusPerPixel
          };
          console.log(`START: ${JSON.stringify(currentProcess)}`)
          event.stopPropagation();
        }
      }
      function onMouseUpOrLeave(event) {
        if (currentProcess) {
          console.log('STOP');
          // TODO: Übernehmen?
          currentProcess = null;
        }
      }
      function onMouseMove(event) {
        if (currentProcess) {
          const minPartLengthInAvus = TOUCH_TOLERANCE_IN_PIXELS * currentProcess.avusPerPixel;
          const touchOffsetInPixels = event.clientX - element.offsetLeft;
          const touchOffsetInAvus = touchOffsetInPixels * currentProcess.avusPerPixel;
          const distanceInAvus = Math.round(touchOffsetInAvus - currentProcess.initialTouchOffsetInAvus);
          const newLeftPartLength = currentProcess.initalLeftPartLengthInAvus + distanceInAvus;
          const newRightPartLength = currentProcess.initalRightPartLengthInAvus - distanceInAvus;
          if (newLeftPartLength >= minPartLengthInAvus && newRightPartLength >= minPartLengthInAvus) {
            work.parts()[currentProcess.leftIndex].length(newLeftPartLength);
            work.parts()[currentProcess.rightIndex].length(newRightPartLength);
          }
        }
      }
    }
  };
}

export default { register };
