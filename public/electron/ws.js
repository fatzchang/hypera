const { nativeImage } = require('electron');
const path = require('path');
const Websocket = require('ws');
const { getScreenshot } = require('./dl');
const { v4: uuidv4 } = require('uuid');

const handleWebSocket = (app, mainWindow) => {
  const wss = new Websocket.Server({ port: 49367 });
  
  const tempDir = app.getPath('temp');
  wss.on('connection', ws => {
    console.log('a client has connected!');
    mainWindow.webContents.send('ws connected');
  
    ws.on('close', () => {
      console.log('disconnected');
      mainWindow.webContents.send('ws disconnected');
    });

    ws.on('message', (dataString) => {
      const data = JSON.parse(dataString);

      const filename = path.join(tempDir, `${uuidv4()}.jpg`);
      const headers = data.requestHeaders.map((header) => {
        return `${header.name}: ${header.value}`;
      }).join('\r\n');

      const downloadProcess = getScreenshot({
        filename,
        headers,
        url: data.url
      });

      downloadProcess.on('close', (statusCode) => {
        if (statusCode === 0) {
          const image = nativeImage.createFromPath(filename);
          if (!image.isEmpty()) {
            mainWindow.webContents.send('video detected', {
              uuid: uuidv4(),
              headers: data.requestHeaders,
              url: data.url,
              initiator: data.initiator,
              image: image.toDataURL()
            });
          }

        }
      })

    })
  })
}

module.exports = { handleWebSocket };