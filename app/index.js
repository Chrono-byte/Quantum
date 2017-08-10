const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const config = require('./config.json')

let win

function createWindow () {
  win = new BrowserWindow({width: 680, height: 560});

  win.loadURL(url.format({
    pathname: 'runes.romtypo.com:8081/',
    protocol: 'http:',
    slashes: true
  }))
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
// Add stuff here
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.