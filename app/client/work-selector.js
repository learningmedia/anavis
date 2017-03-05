require('./ex-links.js')
require('./notifications.js')
require('./actions/zoom.js')
require('./context-menu.js')

const ko = require('knockout');
const defer = require('tiny-defer');
const { ipcRenderer } = require('electron');

const Messenger = require('../shared/messenger');
const events = require('../shared/events');

Messenger.workSelectorInstance = new Messenger('WORK_SELECTOR', ipcRenderer, ipcRenderer);

const LESS_LOG_LEVEL_ERRORS = 1;

// Load stylesheets
window.less = {
  env: 'production',
  async: true,
  fileAsync: true,
  logLevel: LESS_LOG_LEVEL_ERRORS
};

require('less/dist/less.js')

// Enable KO development tools
window.ko = ko;

// Register all bindings:
[].forEach(binding => binding.register());

// Register all components:
[].forEach(component => component.register());

const vm = {};
vm.deferred = defer();
vm.workInfos = ko.observableArray([]);
vm.onWorksSelected = works => vm.deferred.resolve(works);

document.addEventListener('DOMContentLoaded', function () {
  ko.applyBindings(vm, document.getElementsByTagName('html')[0]);
});

Messenger.workSelectorInstance.on(events.SELECT_WORKS, workInfos => {
  vm.workInfos(workInfos);
  return vm.deferred.promise;
})

ipcRenderer.on('less', function () {
  window.less.refresh(true)
    .then(() => console.log('Styles reloaded!'))
    .catch(err => console.error(err))
});
