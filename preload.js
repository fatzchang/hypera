const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('privilegeAPI', {
    ipcSend: ipcRenderer.send,
    ipcOnResponse: (eventName, callback) => {
        ipcRenderer.on(eventName, (event, ...args) => callback(event, ...args))
    }
})
