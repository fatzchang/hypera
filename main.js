const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { spawn } = require('child_process');
const path = require('path');
const downloadList = {};

let mainWindow;
const sizeReg = new RegExp('([0-9]+)kB');
const fileExistReg = new RegExp('\[y/N\]');

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
    const filename = dialog.showSaveDialogSync(mainWindow, {
        filters: [{
            name: 'Movies',
            extensions: ['mp4']
        }]
    })
    console.log(filename);

    //TODO: File './cad.mp4' already exists. Overwrite? [y/N]

    const child_path = path.join(__dirname, 'ffmpeg/bin/ffmpeg.exe');
    const ffmpeg = spawn(child_path, [
        '-protocol_whitelist', 'file,http,https,tcp,tls,crypto',
        '-user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
        '-i', info.url,
        '-c', 'copy', filename
    ]);
    
    ffmpeg.stdout.setEncoding('utf-8');

    // TODO: generate an unique id for this download
    const videoID = 'video1';

    downloadList[videoID] = {
        process: ffmpeg,
        url: info.url,
        saveLocation: info.saveLocation
    }

    event.reply('video download create', {
        videoID: videoID,
        saveLocation: info.saveLocation
    });

    // ffmpeg seems output everything to stderr
    // downloadList[videoID].process.stdout.on('data', data => {
    //     console.log(`stdout: ${data}`);
    // });
    
    downloadList[videoID].process.stderr.on('data', data => {
        // console.log(`stderr: ${data}`);
        const match = data.toString().match(sizeReg);
        if (match) {
            event.reply('downloaded size', match[1]);
        } else if (fileExistReg.test(data)) {
            // overwrite the exist file
            downloadList[videoID].process.stdin.write('y\n');
        }
    });

    downloadList[videoID].process.on('close', (code) => {
        console.log(`ffmpeg closed with code ${code}`);
        event.reply('download status', code);

        // TODO: process
        delete downloadList[videoID];
    })
})

ipcMain.on('cancel download', (event, arg) => {
    downloadList[arg.videoId].process.kill('SIGINT');
})