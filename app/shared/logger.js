const isRenderer = require('is-electron-renderer');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const path = require('path');

if (!isRenderer) {
  log.transports.file.level = isDev ? 'silly' : 'info';
  log.transports.console.level = isDev ? 'silly' : false;
}

const appFolder = path.resolve(__dirname, '..') + path.sep;

function makePathAppRelative(path) {
  return (path + '').startsWith(appFolder) ? path.substr(appFolder.length) : path;
}

class Logger {
  constructor(name) {
    this.name = makePathAppRelative(name);
  }

  error(...args) {
    log.error(`[${this.name}]`, ...args);
  }

  warn(...args) {
    log.warn(`[${this.name}]`, ...args);
  }

  info(...args) {
    log.info(`[${this.name}]`, ...args);
  }

  verbose(...args) {
    log.verbose(`[${this.name}]`, ...args);
  }

  debug(...args) {
    log.debug(`[${this.name}]`, ...args);
  }

  silly(...args) {
    log.silly(`[${this.name}]`, ...args);
  }
}

module.exports = Logger;
