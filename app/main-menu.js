import { app, BrowserWindow } from 'electron';
import env from './env';
import fileDialog from './file-dialog';

function getMainMenuTemplate() {
  const mainMenu = [{
    label: 'File',
    submenu: [{
      label: 'New',
      accelerator: 'CmdOrCtrl+N',
      click: () => {}
    }, {
      label: 'Open...',
      accelerator: 'CmdOrCtrl+O',
      click: () => BrowserWindow.getFocusedWindow().webContents.send('OPEN_FILE')
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => app.quit()
    }]
  }];
  if (env.name !== 'production') {
    mainMenu.push({
      label: 'Development',
      submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache()
      }, {
        label: 'Toggle DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: () => BrowserWindow.getFocusedWindow().toggleDevTools()
      }]
    });
  }
  return mainMenu;
}

export default { getMainMenuTemplate };
