'use strict'

const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const defer = require('tiny-defer');
const path = require('path')
const _ = require('lodash')

const isLiveReload = process.env.LIVE_RELOAD === 'true';

const Messenger = require('../shared/messenger');
const events = require('../shared/events');
const pkg = require('../../package.json')

// Use system log facility
require('./lib/log')(pkg.name)

// Manage unhandled exceptions as early as possible
process.on('uncaughtException', (error) => {
  console.error(`Caught unhandled exception: ${error}`)
  dialog.showErrorBox('Caught unhandled exception', error.message || 'Unknown error message')
  app.quit()
})

// Load build target configuration file
try {
  var config = require('../config.json')
  _.merge(pkg.config, config)
} catch (e) {
  console.warn('No config file loaded, using defaults')
}

const isDev = (require('electron-is-dev') || pkg.config.debug)
global.appSettings = pkg.config

if (isDev) {
  console.info('Running in development')
} else {
  console.info('Running in production')
}

console.debug(JSON.stringify(pkg.config))

// Adds debug features like hotkeys for triggering dev tools and reload
// (disabled in production, unless the menu item is displayed)
require('electron-debug')({
  enabled: pkg.config.debug || isDev || false
})

// Prevent window being garbage collected
let mainWindow

// Other windows we may need
let infoWindow = null
let workSelectorWindow = null
let msgBoxWindow = null

let terminationConfirmed = false;

app.setName(pkg.productName)

function initialize () {
  var shouldQuit = makeSingleInstance()
  if (shouldQuit) return app.quit()

  function onClosed () {
    // Dereference used windows
    // for multiple windows store them in an array
    mainWindow = null
    infoWindow = null
    workSelectorWindow = null
    msgBoxWindow = null
  }

  function createMainWindow () {
    const win = new BrowserWindow({
      'width': 1024,
      'height': 768,
      'title': app.getName(),
      'webPreferences': {
        'nodeIntegration': pkg.config.nodeIntegration || true, // Disabling node integration allows to use libraries such as jQuery/React, etc
        'preload': path.resolve(path.join(__dirname, 'preload.js'))
      }
    })

    Messenger.mainWindowInstance = new Messenger('MAIN_WINDOW', win.webContents, ipcMain);

    Messenger.mainWindowInstance.on(events.OPEN_SELECTOR, workInfos => {
      if (workSelectorWindow) {
        return;
      }
      workSelectorWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        width: 600,
        height: 400
      });
      workSelectorWindow.setMenu(null);
      const deferred = defer();
      let workIdsToSave;
      workSelectorWindow.loadURL(`file://${__dirname}/../client/work-selector.html`);
      const workSelectorWindowMessenger = new Messenger('WORK_SELECTOR', workSelectorWindow.webContents, ipcMain);
      workSelectorWindow.webContents.on('did-finish-load', () => {
        // workSelectorWindow.webContents.toggleDevTools();
        workSelectorWindowMessenger.send(events.SELECT_WORKS, workInfos).then(selectedWorkIds => {
          workIdsToSave = selectedWorkIds;
          workSelectorWindow.close();
        });
      });

      workSelectorWindow.on('closed', () => {
        workSelectorWindowMessenger.dispose();
        workSelectorWindow = null;
        deferred.resolve(workIdsToSave);
      });

      workSelectorWindow.webContents.on('crashed', err => {
        alert(err);
      });

      return deferred.promise;
    });

    Messenger.mainWindowInstance.on(events.OPEN_MESSAGE_BOX, msgBoxOptions => {
      if (msgBoxWindow) {
        return;
      }
      msgBoxWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        width: 400,
        height: 200
      });
      msgBoxWindow.setMenu(null);
      const deferred = defer();
      let result;
      msgBoxWindow.loadURL(`file://${__dirname}/../client/message-box.html`);
      const msgBoxWindowMessenger = new Messenger('MESSAGE_BOX', msgBoxWindow.webContents, ipcMain);
      msgBoxWindow.webContents.on('did-finish-load', () => {
        // msgBoxWindow.webContents.toggleDevTools();
        msgBoxWindowMessenger.send(events.SHOW_MESSAGE, msgBoxOptions).then(msgBoxResult => {
          result = msgBoxResult;
          msgBoxWindow.close();
        });
      });

      msgBoxWindow.on('closed', () => {
        msgBoxWindowMessenger.dispose();
        msgBoxWindow = null;
        deferred.resolve(result);
      });

      msgBoxWindow.webContents.on('crashed', err => {
        alert(err);
      });

      return deferred.promise;
    });

    // Remove file:// if you need to load http URLs
    win.loadURL(`file://${__dirname}/../client/${pkg.config.url}`, {})

    win.on('closed', onClosed)

    win.on('unresponsive', function () {
      // In the real world you should display a box and do something
      console.warn('The window is not responding')
    })

    win.webContents.on('did-fail-load', (error, errorCode, errorDescription) => {
      var errorMessage

      if (errorCode === -105) {
        errorMessage = errorDescription || '[Connection Error] The host name could not be resolved, check your network connection'
        console.log(errorMessage)
      } else {
        errorMessage = errorDescription || 'Unknown error'
      }

      error.sender.loadURL(`file://${__dirname}/../client/error.html`)
      win.webContents.on('did-finish-load', () => {
        win.webContents.send('app-error', errorMessage)
      })
    })

    win.webContents.on('crashed', () => {
      // In the real world you should display a box and do something
      console.error('The browser window has just crashed')
    })

    win.webContents.on('did-finish-load', () => {
      win.webContents.send('hello')
    })

    win.on('close', event => {
      if (terminationConfirmed || isLiveReload) return
      Messenger.mainWindowInstance.send(events.REQUEST_TERMINATION).then(canTerminate => {
        terminationConfirmed = canTerminate
        if (canTerminate) app.quit()
      })
      event.preventDefault()
    })

    return win
  }

  app.on('before-quit', event => {
    if (terminationConfirmed || isLiveReload) return
    Messenger.mainWindowInstance.send(events.REQUEST_TERMINATION).then(canTerminate => {
      terminationConfirmed = canTerminate
      if (canTerminate) app.quit()
    })
    event.preventDefault()
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (!mainWindow) {
      mainWindow = createMainWindow()
    }
  })

  app.on('ready', () => {
    Menu.setApplicationMenu(createMenu())
    mainWindow = createMainWindow()

    if (isDev) {
      BrowserWindow.addDevToolsExtension(path.resolve(__dirname, '../../chromeextensions-knockoutjs'))

      // Setup live reload
      if (isLiveReload) {
        const { client } = require('electron-connect');
        // Connect to live-reload server process
        client.create(mainWindow).on('reload-styles', () => {
          mainWindow.webContents.send('reload-styles');
        });
      }
    }

    // Manage automatic updates
    try {
      require('./lib/auto-update/update')({
        url: (pkg.config.update) ? pkg.config.update.url || false : false,
        version: app.getVersion()
      })
      ipcMain.on('update-downloaded', (autoUpdater) => {
        // Elegant solution: display unobtrusive notification messages
        mainWindow.webContents.send('update-downloaded')
        ipcMain.on('update-and-restart', () => {
          autoUpdater.quitAndInstall()
        })

        // Basic solution: display a message box to the user
        // var updateNow = dialog.showMessageBox(mainWindow, {
        //   type: 'question',
        //   buttons: ['Yes', 'No'],
        //   defaultId: 0,
        //   cancelId: 1,
        //   title: 'Update available',
        //   message: 'There is an update available, do you want to restart and install it now?'
        // })
        //
        // if (updateNow === 0) {
        //   autoUpdater.quitAndInstall()
        // }
      })
    } catch (e) {
      console.error(e.message)
      dialog.showErrorBox('Update Error', e.message)
    }
  })

  ipcMain.on('open-info-window', () => {
    if (infoWindow) {
      return
    }
    infoWindow = new BrowserWindow({
      width: 600,
      height: 600,
      resizable: false
    })
    infoWindow.loadURL(`file://${__dirname}/../client/info.html`)

    infoWindow.on('closed', () => {
      infoWindow = null
    })
  })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  return app.makeSingleInstance(() => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createMenu () {
  return Menu.buildFromTemplate(require('./lib/menu'))
}

// Manage Squirrel startup event (Windows)
require('./lib/auto-update/startup')(initialize)
