const { ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const sizeReg = new RegExp('([0-9]+)kB');
const fileExistReg = new RegExp('Overwrite');

const getExecutablePath = () => {
  let execPath;
  if (process.env.ELECTRON_DEV_MODE) {
    execPath = path.join(__dirname, '../../assets/ffmpeg.exe');
  } else {
    execPath = path.join(process.resourcesPath, "./assets/ffmpeg.exe");
  }

  return execPath;
}

const askSaveLocation = async (renderer) => {
  const response = await dialog.showSaveDialog(renderer, {
    filters: [{
      name: 'Movies',
      extensions: ['mp4']
    }]
  });

  return response.canceled ? null : response.filePath;
}

const fullDownload = (args) => {
  const ffmpegPath = getExecutablePath();
  const { filename, url, headers } = args;

  const ffmpeg = spawn(ffmpegPath, [
    '-protocol_whitelist', 'file,http,https,tcp,tls,crypto',
    '-user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
    '-headers', headers,
    '-i', url,
    '-c', 'copy', filename
  ]);

  ffmpeg.stdout.setEncoding('utf-8');

  return ffmpeg;
}

const handleDownload = (renderer) => {
  const downloadList = {};

  ipcMain.handle('new video', async (event, info) => {
    const filename = await askSaveLocation(renderer);
    if (!filename) {
      return null;
    }

    // generate an unique id for this download
    const videoId = uuidv4();
    const downloadProcess = fullDownload({
      filename,
      url: info.url,
      headers: info.headers
    });

    downloadList[videoId] = {
      process: downloadProcess,
      url: info.url,
      filename: filename
    }

    // ffmpeg seems output everything to stderr
    downloadProcess.stderr.on('data', data => {
      // get download size information and send to renderer process
      const match = data.toString().match(sizeReg);
      if (match) {
        renderer.webContents.send('downloaded size', {
          videoId,
          downloadedSize: parseInt(match[1])
        });
      }

      // overwrite the exist file [y/N]
      if (fileExistReg.test(data)) {
        downloadProcess.stdin.write('y\n');
      }
    });

    downloadProcess.on('close', (statusCode) => {
      renderer.webContents.send('download status', {
        videoId,
        statusCode
      });

      // remove file if not success
      if (statusCode !== 0) {
        fs.unlink(filename, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }

      delete downloadList[videoId];
      console.log('ffmpeg closed');
    });

    // return from new video request
    return {
      url: info.url,
      filename: filename,
      videoId: videoId
    }
  });


  ipcMain.on('cancel download', (event, arg) => {
    if (downloadList[arg.videoId]) {
      downloadList[arg.videoId].process.kill('SIGINT');
    }
  })
}

module.exports = { handleDownload };