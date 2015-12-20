import ko from 'knockout';
import dragAndDropFiles from 'drag-and-drop-files';

function register() {
  ko.bindingHandlers.soundDrop = {
    init: function (element, valueAccessor) {
      dragAndDropFiles(element, valueAccessor());
    }
  };
}

export default { register };
