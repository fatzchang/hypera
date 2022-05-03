const { ipcRenderer, contextBridge } = require('electron')
const listeners = {};

contextBridge.exposeInMainWorld('privilegeAPI', {
  ipcSend: ipcRenderer.send,
  ipcOnResponse: (eventName, callback) => {
    const saferFn = (event, ...args) => callback(...args);
    ipcRenderer.on(eventName, saferFn);
    const key = Symbol();
    listeners[key] = saferFn;

    return key;
  },
  ipcRemoveHandler: (eventName, key) => {
    const fn = listeners[key];
    delete listeners[key];
    ipcRenderer.removeListener(eventName, fn);
  },
  ipcInvoke: ipcRenderer.invoke,
})
