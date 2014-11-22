'use strict';

let works = [];

function reset() {
  works.length = 0;
}

function executeCommand(command) {
  command.execute();
}

export default {
  works: works,
  reset: reset,
  executeCommand: executeCommand
};
