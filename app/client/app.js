require('./ex-links.js');
require('./notifications.js');
require('./actions/zoom.js');
require('./context-menu.js');

const path = require('path');
const ko = require('knockout');
const { ipcRenderer } = require('electron');

const file = require('./file');
const events = require('../shared/events');
const shortcuts = require('./actions/shortcuts');
const systemSounds = require('./system-sounds');
const work = require('./components/work');
const part = require('./components/part');
const appViewModel = require('./app-view-model');
const fileDrop = require('./bindings/file-drop');
const inspector = require('./components/inspector');
const soundPlayer = require('./components/sound-player');
const annotation = require('./components/annotation');
const checkbox = require('./components/checkbox');
const updateNotification = require('./components/update-notification');
const partOperations = require('./bindings/part-operations');
const Messenger = require('../shared/messenger');

Messenger.mainWindowInstance = new Messenger('MAIN_WINDOW', ipcRenderer, ipcRenderer);

const LESS_LOG_LEVEL_ERRORS = 1;

// Load stylesheets
window.less = {
  env: 'production',
  async: true,
  fileAsync: true,
  relativeUrls: true,
  logLevel: LESS_LOG_LEVEL_ERRORS
};

require('less/dist/less.js')

// Enable KO development tools
window.ko = ko;

// Register all bindings:
[fileDrop, partOperations].forEach(binding => binding.register());

// Register all components:
[work, part, inspector, soundPlayer, annotation, checkbox, updateNotification].forEach(component => component.register());

// Add specific functions to the app vm:
appViewModel.onFileDropped = files => {
  const filePaths = files.map(f => f.path);
  const extensions = filePaths.map(p => (path.extname(p) || '').toLowerCase());
  if (extensions.some(ext => !['.avd'].includes(ext))) return systemSounds.beep();
  file.openAll(filePaths);
};

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

ipcRenderer.on('reload-styles', function () {
  window.less.refresh(true)
    .then(() => console.log('Styles reloaded!'))
    .catch(err => console.error(err))
});
