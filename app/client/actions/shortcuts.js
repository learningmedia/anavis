const ToolHandler = require('./tool-handler');
const PlaySoundHandler = require('./play-sound-handler');
const tools = require('../../shared/tools');

function register(element, appViewModel) {

  const shortcuts = new Map();
  shortcuts.set('N', new ToolHandler(appViewModel, tools.DEFAULT));
  shortcuts.set('S', new ToolHandler(appViewModel, tools.SCISSORS));
  shortcuts.set('K', new ToolHandler(appViewModel, tools.GLUE));
  shortcuts.set(' ', new PlaySoundHandler(appViewModel));

  element.addEventListener('keydown', function (event) {
    if (isFromEditable(event)) return;
    const key = getAcceleratorFromKeyboardEvent(event);
    if (shortcuts.has(key)) {
      const handler = shortcuts.get(key);
      handler.onKeyDown();
    }
  });

  element.addEventListener('keyup', function (event) {
    if (isFromEditable(event)) return;
    const key = getAcceleratorFromKeyboardEvent(event);
    if (shortcuts.has(key)) {
      const handler = shortcuts.get(key);
      handler.onKeyUp();
    }
  });

}

function isFromEditable(event) {
  return ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(event.target.nodeName);
}

function getAcceleratorFromKeyboardEvent(event) {
  let str = [];
  if (event.metaKey || event.ctrlKey) str.push('CmdOrCtrl');
  if (event.altKey) str.push('Alt');
  if (event.shiftKey) str.push('Shift');
  if (!isKeyCodeModifier(event.keyCode)) str.push(getKeyName(event));
  return str.join('+');
}

function isKeyCodeModifier(keyCode) {
  return [16, 17, 18, 91, 93, 224].indexOf(keyCode) !== -1;
}

function getKeyName(event) {
  if (event.key.length === 1) {
    return /[A-Za-z\u0080-\u00FF ]+/.test(event.key) ? event.key.toUpperCase() : event.key;
  }
  return event.code.replace(/^Arrow/, '');
}

module.exports.register = register;
