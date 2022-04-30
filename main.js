const { app, BrowserWindow, ipcMain } = require('electron')
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800, 
        height: 600,
        webPreferences: {
            preload: path.resolve('preload.js')
        }
    });

    
    if (process.env.ELECTRON_DEV_MODE) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        console.log(path.join(__dirname, 'build/index.html'))
        mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
    }
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.whenReady().then(() => {
    createWindow();
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

// ipc section
ipcMain.on('new video', (event, info) => {
    const child_path = path.join(__dirname, 'ffmpeg/bin/ffmpeg.exe');
    const ffmpeg = spawn(child_path, [
        '-protocol_whitelist', 'file,http,https,tcp,tls,crypto',
        '-user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
        '-i', info.url,
        '-c', 'copy', `${info.saveLocation}.mp4`
    ]);

    ffmpeg.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
    });
    
    ffmpeg.stderr.on('data', data => {
        console.log(`stderr: ${data}`);
        event.reply('download status', data.toString());
    });

    ffmpeg.on('close', (code) => {
        console.log(`ffmpeg closed with code ${code}`);
    })
})