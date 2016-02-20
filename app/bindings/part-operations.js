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

  for (let currentPartIndex = 0, currentBorderOffsetInAvus = 0; currentPartIndex < totalParts; currentPartIndex += 1) {
    const currentPartLength = work.parts()[currentPartIndex].length();
    const leftBorderOffsetInAvus = currentBorderOffsetInAvus;
    const rightBorderOffsetInAvus = leftBorderOffsetInAvus + currentPartLength;
    const isTouchWithinCurrentPart = touchOffsetInAvus >= leftBorderOffsetInAvus && touchOffsetInAvus < rightBorderOffsetInAvus;
    if (isTouchWithinCurrentPart) {
      const info = {};
      info.isResizing = false;
      info.index = currentPartIndex;
      info.avusPerPixel = avusPerPixel;
      info.initialTouchOffsetInAvus = touchOffsetInAvus;

      if (touchOffsetInAvus <= (leftBorderOffsetInAvus + touchToleranceInAvus) && currentPartIndex !== 0) {
        info.isResizing = true;
        info.leftIndex = currentPartIndex - 1;
        info.rightIndex = currentPartIndex;
        info.initalLeftPartLengthInAvus = work.parts()[currentPartIndex - 1].length();
        info.initalRightPartLengthInAvus = work.parts()[currentPartIndex].length();
      } else if (touchOffsetInAvus >= (rightBorderOffsetInAvus - touchToleranceInAvus) && currentPartIndex !== (totalParts - 1)) {
        info.isResizing = true;
        info.leftIndex = currentPartIndex;
        info.rightIndex = currentPartIndex + 1;
        info.initalLeftPartLengthInAvus = work.parts()[currentPartIndex].length();
        info.initalRightPartLengthInAvus = work.parts()[currentPartIndex + 1].length();
      }

      return info;
    }

    currentBorderOffsetInAvus = rightBorderOffsetInAvus;
  }

  return undefined;
}

function applyMovementInfo(currentMovementInfo, work, element) {
  if (!currentMovementInfo || !currentMovementInfo.isResizing) {
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

function toggleResizeCursor(element, currentMovementInfo) {
  if (currentMovementInfo && currentMovementInfo.isResizing) {
    element.classList.add('u-col-resize');
  } else {
    element.classList.remove('u-col-resize');
  }
}

function register() {
  ko.bindingHandlers.partOperations = {
    init: function (element, valueAccessor) {
      const work = valueAccessor().work;

      registerEventListenerWithTeardown(element, 'mousedown', onMouseDown);
      registerEventListenerWithTeardown(element, 'mouseup', onMouseUp);
      registerEventListenerWithTeardown(element, 'mouseleave', onMouseLeave);
      registerEventListenerWithTeardown(element, 'mousemove', onMouseMove);

      let currentMovementInfo = undefined;

      function onMouseDown(event) {
        currentMovementInfo = getMovementInfo(element, event, work);
        toggleResizeCursor(element, currentMovementInfo);
      }

      function onMouseUp(event) {
        currentMovementInfo = undefined;
        toggleResizeCursor(element, currentMovementInfo);
      }

      function onMouseLeave(event) {
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
