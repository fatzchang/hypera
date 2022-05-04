const { ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const sizeReg = new RegExp('([0-9]+)kB');
const fileExistReg = new RegExp('Overwrite');

const handleDownload = (mainWindow) => {
  const downloadList = {};

  ipcMain.handle('new video', async (event, info) => {
    let ffmpegPath;
    if(process.env.ELECTRON_DEV_MODE){
      ffmpegPath = path.join(__dirname, '../../assets/ffmpeg.exe');
    } else {
      ffmpegPath = path.join(process.resourcesPath, "./assets/ffmpeg.exe");
    }
  
    const response = await dialog.showSaveDialog(mainWindow, {
      filters: [{
        name: 'Movies',
        extensions: ['mp4']
      }]
    });
  
    if (response.canceled) {
      return null;
    }
    const ffmpeg = spawn(ffmpegPath, [
      '-protocol_whitelist', 'file,http,https,tcp,tls,crypto',
      '-user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
      '-i', info.url,
      '-c', 'copy', response.filePath
    ]);
  
    ffmpeg.stdout.setEncoding('utf-8');
  
    // generate an unique id for this download
    const videoId = uuidv4();
  
    downloadList[videoId] = {
      process: ffmpeg,
      url: info.url,
      filename: response.filePath
    }
  
    // ffmpeg seems output everything to stderr
    // downloadList[videoId].process.stdout.on('data', data => {
    //     console.log(`stdout: ${data}`);
    // });
  
    downloadList[videoId].process.stderr.on('data', data => {
      console.log(`${downloadList[videoId].filename}: ${data}`);
      const match = data.toString().match(sizeReg);
      if (match) {
        
        mainWindow.webContents.send('downloaded size', {
          videoId: videoId,
          downloadedSize: parseInt(match[1])
        });
  
      } else if (fileExistReg.test(data)) {
        // overwrite the exist file
        downloadList[videoId].process.stdin.write('y\n');
      }
    });
  
    downloadList[videoId].process.on('close', (code) => {
      mainWindow.webContents.send('download status', {
        videoId: videoId,
        statusCode: code
      });
      
      // remove file if not success
      if (code !== 0) {
        fs.unlink(downloadList[videoId].filename, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
      
      delete downloadList[videoId];
      console.log('ffmpeg closed');
    });
  
    return {
      url: info.url,
      filename: response.filePath,
      id: videoId
    }
  });
  
  
  ipcMain.on('cancel download', (event, arg) => {
    if (downloadList[arg.videoId]) {
      downloadList[arg.videoId].process.kill('SIGINT');
    }
  })
}

module.exports = { handleDownload };