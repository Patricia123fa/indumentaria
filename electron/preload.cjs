const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronWindow', {
  exitFullscreen: () => ipcRenderer.send('window:exit-fullscreen'),
});
