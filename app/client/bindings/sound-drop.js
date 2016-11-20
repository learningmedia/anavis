const ko = require ('knockout');
const dragAndDropFiles = require ('drag-and-drop-files');

function register() {
  ko.bindingHandlers.soundDrop = {
    init: function (element, valueAccessor) {
      dragAndDropFiles(element, valueAccessor());
    }
  };
}

module.exports = { register };
