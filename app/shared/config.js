const electron = require('electron');
const isRenderer = require('is-electron-renderer');
const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

const logger = new Logger(__filename);
let userDataDir;

let config = {
  lastWindowPosition: undefined,
  recentUsedFiles: []
};

if (isRenderer) {
  userDataDir = electron.remote.app.getPath('userData');
} else {
  userDataDir = electron.app.getPath('userData');
}

const filename = path.join(userDataDir, 'settings.json');

function saveValue(key, value) {
  updateConfig();
  const oldValue = config[key];
  if (oldValue !== value) {
    config[key] = value;
  }
  saveConfig();
  logger.info(`${value} in ${key} was saved.`);
}

function getValue(key) {
  updateConfig();
  return config[key];
}

function pushValue(collectionName, value, maxEntries = 10) {
  updateConfig();
  const coll = config[collectionName];
  if (!coll) {
    config[collectionName] = [];
  }
  const index = coll.indexOf(value);
  if (index > -1) {
    coll.splice(index, 1);
  }
  coll.push(value);
  config[collectionName] = coll.slice(-maxEntries);
  saveConfig();
  logger.info(`${value} in ${collectionName} was saved.`);
}

function updateConfig() {
  if (fs.existsSync(filename)) {
    const configFromSettings = JSON.parse(fs.readFileSync(filename, 'utf8'));
    config = Object.assign(config, configFromSettings);
  }
}

function saveConfig() {
   fs.writeFileSync(filename, JSON.stringify(config), 'utf8');
}

module.exports = {
  saveValue,
  getValue,
  pushValue
}
