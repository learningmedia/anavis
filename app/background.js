// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, BrowserWindow } from 'electron';
import windowStateKeeper from './vendor/electron_boilerplate/window_state';
import mainMenu from './main-menu';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';


// Preserver of the window size and position between app launches.
const mainWindowState = windowStateKeeper('main', {
  width: 1000,
  height: 600
});

app.on('ready', function () {
  BrowserWindow.addDevToolsExtension(`${__dirname}/chromeextensions-knockoutjs`);

  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height
  });

  mainMenu.setMenu(mainWindow);

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  if (env.name === 'test') {
    mainWindow.loadURL(`file://${__dirname}/spec.html`);
  } else {
    mainWindow.loadURL(`file://${__dirname}/app.html`);
  }

  if (env.name !== 'production') {
    mainWindow.openDevTools();
  }

  mainWindow.on('close', function () {
    mainWindowState.saveState(mainWindow);
  });
});

app.on('window-all-closed', function () {
  app.quit();
});
