import { app, Menu } from 'electron';
import env from './env';
import events from './events';

function setMenu(mainWindow) {
  const menuTemplate = [{
    label: 'File',
    submenu: [{
      label: 'New',
      accelerator: 'CmdOrCtrl+N',
      click: () => mainWindow.webContents.send(events.NEW_FILE)
    }, {
      label: 'Open...',
      accelerator: 'CmdOrCtrl+O',
      click: () => mainWindow.webContents.send(events.OPEN_FILE)
    }, {
      label: 'Save',
      accelerator: 'CmdOrCtrl+S',
      click: () => mainWindow.webContents.send(events.SAVE_FILE)
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => app.quit()
    }]
  }];

  if (env.name !== 'production') {
    menuTemplate.push({
      label: 'Development',
      submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => mainWindow.webContents.reloadIgnoringCache()
      }, {
        label: 'Toggle DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: () => mainWindow.toggleDevTools()
      }]
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

export default { setMenu };
