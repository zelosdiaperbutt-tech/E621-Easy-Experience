const { contextBridge, ipcRenderer } = require('electron')

contextBridge.executeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})