const Websocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new Websocket.Server({ port: 49367 });

const handleWebSocket = (mainWindow) => {
  wss.on('connection', ws => {
    console.log('a client has connected!');
  
    ws.on('close', () => {
      console.log('disconnected');
    });

    ws.on('message', (dataString) => {
      const data = JSON.parse(dataString);
      console.log(data)

      mainWindow.webContents.send('video detected', {
        uuid: uuidv4(),
        headers: data.requestHeaders,
        url: data.url,
        initiator: data.initiator
      });
    })
  })
}

module.exports = { handleWebSocket };