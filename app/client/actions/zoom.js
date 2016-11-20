const electron = require('electron')
const { ipcRenderer, webFrame } = electron;
const { Menu } = electron.remote

const maximumZoomLevel = 3

var currentZoomLevel, zoomMenuItems

function getZoomUI () {
  const menu = Menu.getApplicationMenu()
  var menuItems = []
  menu.items.forEach((item) => {
    if (item.id === 'view') {
      item.submenu.items.forEach((item) => {
        if (item.id && item.id.match(/^zoom-.*/)) {
          menuItems.push(item)
        }
      })
    }
  })
  return menuItems
}

function enableZoomUI () {
  zoomMenuItems.forEach((item) => {
    item.enabled = true
  })
}

function disableZoomUI () {
  zoomMenuItems.forEach((item) => {
    item.enabled = false
  })
}

window.addEventListener('blur', () => {
  disableZoomUI()
})

window.addEventListener('focus', () => {
  enableZoomUI()
})

window.addEventListener('load', () => {
  currentZoomLevel = webFrame.getZoomLevel()
  zoomMenuItems = getZoomUI()
  enableZoomUI()
})
ipcRenderer.on('zoom-actual', () => {
  currentZoomLevel = webFrame.setZoomLevel(0)
})
ipcRenderer.on('zoom-in', () => {
  if (currentZoomLevel < maximumZoomLevel) {
    currentZoomLevel = webFrame.setZoomLevel(currentZoomLevel + 1)
  }
})
ipcRenderer.on('zoom-out', () => {
  if (currentZoomLevel > 0) {
    currentZoomLevel = webFrame.setZoomLevel(currentZoomLevel - 1)
  }
})
