const { app, BrowserWindow } = require('electron');
const path = require('path');
const { handleDownload } = require('./dl');
const { handleWebSocket } = require('./ws');

let mainWindow;

// prevent "Passthrough is not supported, GL is disabled" error
app.disableHardwareAcceleration();
app.setAsDefaultProtocolClient('hypera');
// allow only one instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv, cwd) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      
      mainWindow.focus();
    }
  });
  
  
  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.resolve(__dirname, 'preload.js')
      }
    });
  
  
    if (process.env.ELECTRON_DEV_MODE) {
      mainWindow.loadURL('http://localhost:3000');
    } else {
      mainWindow.loadFile(path.join(__dirname, '../index.html'));
    }
    // mainWindow.webContents.openDevTools();
  
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      mainWindow = null;
      app.quit();
    })
  }
  
  app.whenReady().then(() => {
    createWindow();
    handleDownload(mainWindow);
    handleWebSocket(app, mainWindow);
  })
  
  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });
  
  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  }); 
}
