const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', { getQr: () => ipcRenderer.invoke('get-qr') });
