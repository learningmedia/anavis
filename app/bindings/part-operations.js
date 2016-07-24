import ko from 'knockout';
import uuid from 'uuid';

const TOUCH_TOLERANCE_IN_PIXELS = 12;

// AVU == AnaVis Units

function registerEventListenerWithTeardown(element, event, handler) {
  element.addEventListener(event, handler);
  ko.utils.domNodeDisposal.addDisposeCallback(element, () => element.removeEventListener(event, handler));
}

function getOperationsInfo(element, event, work) {
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
      info.touchOffsetWithinPartInAvus = touchOffsetInAvus - leftBorderOffsetInAvus;

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

function applyMovement(currentOperationsInfo, work, element) {
  if (!currentOperationsInfo || !currentOperationsInfo.isResizing) {
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

function applyRelease(currentOperationsInfo, work, element, event, app) {
  if (!currentOperationsInfo || currentOperationsInfo.isResizing) {
    return;
  }
  const newInfo = getOperationsInfo(element, event, work);
  if (newInfo && !newInfo.isResizing && newInfo.index === currentOperationsInfo.index) {
    const clickedPart = work.parts()[newInfo.index];

    if (app.currentTool() === 'default') {
      app.currentPart(clickedPart);
    } else if (app.currentTool() === 'scissors') {
      splitPart(work, newInfo.index, newInfo.touchOffsetWithinPartInAvus);
      app.currentPart(work.parts()[newInfo.index + 1]);
    } else if (app.currentTool() === 'glue') {
      console.log('right or left is here the question!');
    }
    event.stopPropagation();
  }
}

function toggleResizeCursor(element, currentOperationsInfo) {
  if (currentOperationsInfo && currentOperationsInfo.isResizing) {
    element.classList.add('u-col-resize');
  } else {
    element.classList.remove('u-col-resize');
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
        currentOperationsInfo = getOperationsInfo(element, event, work);
        toggleResizeCursor(element, currentOperationsInfo);
      }

      function onMouseUp(event) {
        applyRelease(currentOperationsInfo, work, element, event, app);
        currentOperationsInfo = undefined;
        toggleResizeCursor(element, undefined);
      }

      function onMouseLeave(event) {
        currentOperationsInfo = undefined;
        toggleResizeCursor(element, currentOperationsInfo);
      }

      function onMouseMove(event) {
        applyMovement(currentOperationsInfo, work, element);
        toggleResizeCursor(element, currentOperationsInfo || getOperationsInfo(element, event, work));
      }
    }
  };
}

////// TODO EXTRACT ///////////////////////////////

function splitPart(work, partIndex, splitPoint) {
  console.log('YAY');
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
