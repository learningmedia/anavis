'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const isDev = require('electron-is-dev')

const FILE_STREAM_FLAG_APPEND = 'a';

// Set default output streams (STDOUT/STDERR) and an empty log file path
let output = process.stdout
let errorOutput = process.stderr

module.exports = function (logFileName) {

  // If a log file is defined we redirect logs to ~/.[logFileName].log
  if (logFileName) {
    const logFile = path.join(os.homedir(), `.${logFileName.replace(/\s+/g, '')}.log`)
    output = fs.createWriteStream(logFile, { flags: FILE_STREAM_FLAG_APPEND })
    errorOutput = fs.createWriteStream(logFile, { flags: FILE_STREAM_FLAG_APPEND })
  }

  // Create common logger and override default log utilities
  const logger = new console.Console(output, errorOutput)

  console.log = function (...args) {
    logger.log.apply(null, [new Date().toISOString(), '-', ...args])
  }

  console.debug = function (...args) {
    if (isDev || (global.appSettings && global.appSettings.debug)) {
      logger.log.apply(null, [new Date().toISOString(), '-', '<DEBUG>', ...args]);
    }
  }

  console.info = function (...args) {
    logger.log.apply(null, [new Date().toISOString(), '-', '<INFO>', ...args]);
  }

  console.warn = function (...args) {
    logger.log.apply(null, [new Date().toISOString(), '-', '<WARNING>', ...args]);
  }

  console.error = function (...args) {
    logger.log.apply(null, [new Date().toISOString(), '-', '<ERROR>', ...args]);
  }

};
