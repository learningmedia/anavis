require('./ex-links.js')
require('./notifications.js')
require('./actions/zoom.js')
require('./context-menu.js')

const ko = require('knockout');
const { ipcRenderer } = require('electron');

const file = require('./file');
const events = require('../shared/events');
const shortcuts = require('./actions/shortcuts')
const work = require('./components/work');
const part = require('./components/part');
const appViewModel = require('./app-view-model');
const soundDrop = require('./bindings/sound-drop');
const inspector = require('./components/inspector');
const soundPlayer = require('./components/sound-player');
const annotation = require('./components/annotation');
const checkbox = require('./components/checkbox');
const update = require('./components/update');
const partOperations = require('./bindings/part-operations');
const Messenger = require('../shared/messenger');

Messenger.mainWindowInstance = new Messenger('MAIN_WINDOW', ipcRenderer, ipcRenderer);

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
[soundDrop, partOperations].forEach(binding => binding.register());

// Register all components:
[work, part, inspector, soundPlayer, annotation, checkbox, update].forEach(component => component.register());

appViewModel.deselectAll = () => appViewModel.currentPart(undefined);

document.addEventListener('DOMContentLoaded', function() {
  ko.applyBindings(appViewModel, document.getElementsByTagName('html')[0]);
  shortcuts.register(window, appViewModel);
});

ipcRenderer.on(events.NEW_FILE, function () {
  file.create();
});

ipcRenderer.on(events.OPEN_FILE, function () {
  file.open();
});

ipcRenderer.on(events.SAVE_FILE, function () {
  file.save();
});

ipcRenderer.on(events.CLOSE_FILE, function () {
  file.close();
});

Messenger.mainWindowInstance.on(events.REQUEST_TERMINATION, () => {
  return confirm('Echt jetzt?');
})

ipcRenderer.on('less', function () {
  window.less.refresh(true)
    .then(() => console.log('Styles reloaded!'))
    .catch(err => console.error(err))
});
