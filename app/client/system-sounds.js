const path = require('path');
const soundController = require('./sound-controller');

const beepController = soundController.create(path.resolve(__dirname, './beep.mp3'));

function beep() {
  beepController.start();
}

module.exports = {
  beep
};
