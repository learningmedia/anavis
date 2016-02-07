import ko from 'knockout';

const TOUCH_TOLERANCE_IN_PIXELS = 12;

// AVU == AnaVis Units

function registerEventListenerWithTeardown(element, event, handler) {
  element.addEventListener(event, handler);
  ko.utils.domNodeDisposal.addDisposeCallback(element, () => element.removeEventListener(event, handler));
}

function getMovementInfo(element, event, work) {
  const totalWorkLengthInPixels = element.clientWidth;
  const touchOffsetInPixels = event.clientX - element.offsetLeft;
  const totalParts = work.parts().length;
  const totalWorkLengthInAvus = work.parts().reduce((sum, currentPart) => sum + currentPart.length(), 0);
  const avusPerPixel = totalWorkLengthInAvus / totalWorkLengthInPixels;
  const touchOffsetInAvus = touchOffsetInPixels * avusPerPixel;
  const touchToleranceInAvus = TOUCH_TOLERANCE_IN_PIXELS * avusPerPixel;
  for (let currentLeftPartIndex = 0, currentBorderOffsetInAvus = 0; currentLeftPartIndex < totalParts - 1; currentLeftPartIndex += 1) {
    const currentLeftPart = work.parts()[currentLeftPartIndex];
    currentBorderOffsetInAvus += currentLeftPart.length();
    const minTouchOffsetInAvus = currentBorderOffsetInAvus - touchToleranceInAvus;
    const maxTouchOffsetInAvus = currentBorderOffsetInAvus + touchToleranceInAvus;
    if (touchOffsetInAvus >= minTouchOffsetInAvus && touchOffsetInAvus <= maxTouchOffsetInAvus) {
      return {
        initialTouchOffsetInAvus: touchOffsetInAvus,
        leftIndex: currentLeftPartIndex,
        rightIndex: currentLeftPartIndex + 1,
        initalLeftPartLengthInAvus: work.parts()[currentLeftPartIndex].length(),
        initalRightPartLengthInAvus: work.parts()[currentLeftPartIndex + 1].length(),
        avusPerPixel: avusPerPixel
      };
    }
  }
  return undefined;
}

function applyMovementInfo(currentMovementInfo, work, element) {
  if (!currentMovementInfo) {
    return;
  }
  const minPartLengthInAvus = TOUCH_TOLERANCE_IN_PIXELS * currentMovementInfo.avusPerPixel;
  const touchOffsetInPixels = event.clientX - element.offsetLeft;
  const touchOffsetInAvus = touchOffsetInPixels * currentMovementInfo.avusPerPixel;
  const distanceInAvus = Math.round(touchOffsetInAvus - currentMovementInfo.initialTouchOffsetInAvus);
  const newLeftPartLength = currentMovementInfo.initalLeftPartLengthInAvus + distanceInAvus;
  const newRightPartLength = currentMovementInfo.initalRightPartLengthInAvus - distanceInAvus;
  if (newLeftPartLength >= minPartLengthInAvus && newRightPartLength >= minPartLengthInAvus) {
    work.parts()[currentMovementInfo.leftIndex].length(newLeftPartLength);
    work.parts()[currentMovementInfo.rightIndex].length(newRightPartLength);
  }
}

function toggleResizeCursor(element, isMoving) {
  if (isMoving) {
    element.classList.add('u-col-resize');
  } else {
    element.classList.remove('u-col-resize');
  }
}

function register() {
  ko.bindingHandlers.moveBorder = {
    init: function (element, valueAccessor) {
      const work = valueAccessor().work;

      registerEventListenerWithTeardown(element, 'mousedown', onMouseDown);
      registerEventListenerWithTeardown(element, 'mouseup', onMouseUpOrLeave);
      registerEventListenerWithTeardown(element, 'mouseleave', onMouseUpOrLeave);
      registerEventListenerWithTeardown(element, 'mousemove', onMouseMove);

      let currentMovementInfo = undefined;

      function onMouseDown(event) {
        currentMovementInfo = getMovementInfo(element, event, work);
        toggleResizeCursor(element, currentMovementInfo);
      }

      function onMouseUpOrLeave(event) {
        currentMovementInfo = undefined;
        toggleResizeCursor(element, currentMovementInfo);
      }

      function onMouseMove(event) {
        applyMovementInfo(currentMovementInfo, work, element);
        toggleResizeCursor(element, currentMovementInfo || getMovementInfo(element, event, work));
      }
    }
  };
}

export default { register };
