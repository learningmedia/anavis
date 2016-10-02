import ko from 'knockout';
import uuid from 'uuid';

const TOUCH_TOLERANCE_IN_PIXELS = 12;

// AVU == AnaVis Units

function registerEventListenerWithTeardown(element, event, handler) {
  element.addEventListener(event, handler);
  ko.utils.domNodeDisposal.addDisposeCallback(element, () => element.removeEventListener(event, handler));
}

function getOperationsInfo(element, event, work, app) {
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
      info.currentTool = app.currentTool();
      info.isBetweenTwoParts = false;
      info.index = currentPartIndex;
      info.avusPerPixel = avusPerPixel;
      info.initialTouchOffsetInAvus = touchOffsetInAvus;
      info.touchOffsetWithinPartInAvus = touchOffsetInAvus - leftBorderOffsetInAvus;

      if (touchOffsetInAvus <= (leftBorderOffsetInAvus + touchToleranceInAvus) && currentPartIndex !== 0) {
        info.isBetweenTwoParts = true;
        info.leftIndex = currentPartIndex - 1;
        info.rightIndex = currentPartIndex;
        info.initalLeftPartLengthInAvus = work.parts()[currentPartIndex - 1].length();
        info.initalRightPartLengthInAvus = work.parts()[currentPartIndex].length();
      } else if (touchOffsetInAvus >= (rightBorderOffsetInAvus - touchToleranceInAvus) && currentPartIndex !== (totalParts - 1)) {
        info.isBetweenTwoParts = true;
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

function applyMovement(currentOperationsInfo, work, element) {
  if (!currentOperationsInfo || !currentOperationsInfo.isBetweenTwoParts || currentOperationsInfo.currentTool !== 'default') {
    return;
  }
  const minPartLengthInAvus = TOUCH_TOLERANCE_IN_PIXELS * currentOperationsInfo.avusPerPixel;
  const touchOffsetInPixels = event.clientX - element.offsetLeft;
  const touchOffsetInAvus = touchOffsetInPixels * currentOperationsInfo.avusPerPixel;
  const distanceInAvus = Math.round(touchOffsetInAvus - currentOperationsInfo.initialTouchOffsetInAvus);
  const newLeftPartLength = currentOperationsInfo.initalLeftPartLengthInAvus + distanceInAvus;
  const newRightPartLength = currentOperationsInfo.initalRightPartLengthInAvus - distanceInAvus;
  if (newLeftPartLength >= minPartLengthInAvus && newRightPartLength >= minPartLengthInAvus) {
    work.parts()[currentOperationsInfo.leftIndex].length(newLeftPartLength);
    work.parts()[currentOperationsInfo.rightIndex].length(newRightPartLength);
  }
}

function applyRelease(work, element, event, app) {
  const newInfo = getOperationsInfo(element, event, work, app);
  event.stopPropagation();

  if (newInfo.currentTool === 'scissors' && !newInfo.isBetweenTwoParts) {
    splitPart(work, newInfo.index, newInfo.touchOffsetWithinPartInAvus);
    return;
  }

  if (newInfo.currentTool === 'glue' && newInfo.isBetweenTwoParts) {
    mergeParts(work, newInfo.leftIndex, newInfo.rightIndex);
    return;
  }

  if (newInfo.currentTool === 'default' && newInfo.isBetweenTwoParts) {
    return;
  }

  const clickedPart = work.parts()[newInfo.index];
  app.currentPart(clickedPart);
}

function toggleCursorClass(element, currentOperationsInfo) {
  if (currentOperationsInfo && currentOperationsInfo.isBetweenTwoParts) {
    element.classList.add('u-cursor-between-two-parts');
    element.classList.remove('u-cursor-in-part');
  } else {
    element.classList.remove('u-cursor-between-two-parts');
    element.classList.add('u-cursor-in-part');
  }
}

function register() {
  ko.bindingHandlers.partOperations = {
    init: function (element, valueAccessor) {
      const app = valueAccessor().app;
      const work = valueAccessor().work;

      registerEventListenerWithTeardown(element, 'mousedown', onMouseDown);
      registerEventListenerWithTeardown(element, 'mouseup', onMouseUp);
      registerEventListenerWithTeardown(element, 'mouseleave', onMouseLeave);
      registerEventListenerWithTeardown(element, 'mousemove', onMouseMove);

      let currentOperationsInfo = undefined;

      function onMouseDown(event) {
        currentOperationsInfo = getOperationsInfo(element, event, work, app);
        toggleCursorClass(element, currentOperationsInfo);
      }

      function onMouseUp(event) {
        applyMovement(currentOperationsInfo, work, element);
        applyRelease(work, element, event, app);
        currentOperationsInfo = undefined;
        toggleCursorClass(element, undefined);
      }

      function onMouseLeave(event) {
        currentOperationsInfo = undefined;
        toggleCursorClass(element, currentOperationsInfo);
      }

      function onMouseMove(event) {
        applyMovement(currentOperationsInfo, work, element);
        toggleCursorClass(element, currentOperationsInfo || getOperationsInfo(element, event, work, app));
      }
    }
  };
}

////// TODO EXTRACT ///////////////////////////////

function splitPart(work, partIndex, splitPoint) {
  const oldPartsArray = work.parts();
  const partToSplit = oldPartsArray[partIndex];
  const originalLength = partToSplit.length();

  const leftClone = clonePart(partToSplit);
  const rightClone = clonePart(partToSplit);
  leftClone.length(splitPoint);
  rightClone.length(originalLength - splitPoint);

  const newPartsArray = [];
  oldPartsArray.slice(0, partIndex).forEach(x => newPartsArray.push(x));
  newPartsArray.push(leftClone);
  newPartsArray.push(rightClone);
  oldPartsArray.slice(partIndex + 1).forEach(x => newPartsArray.push(x));

  work.parts(newPartsArray);
}

function mergeParts(work, leftIndex, rightIndex) {
  const lengthToAdd = work.parts()[rightIndex].length();
  const leftPart = work.parts()[leftIndex];
  work.parts.splice(rightIndex, 1);
  leftPart.length(leftPart.length() + lengthToAdd);
}

function clonePart(part) {
  return {
    id: ko.observable(newId()),
    length: ko.observable(part.length()),
    color: ko.observable(part.color()),
    name: ko.observable(part.name())
  };
}

function newId() {
  return uuid.v4();
}

export default { register };
