const {app, BrowserWindow} = require('electron');
const path = require('path');

function createWindow(){
    const win = new BrowserWindow({
    width: 1200,
    height: 800,
     autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false
    });
    win.loadFile('mainapp.html');
    win.once('ready-to-show', () => win.show());
  }
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});