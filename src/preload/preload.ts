import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})

contextBridge.exposeInMainWorld('save-secure', {
    saveAPIKey: (key: string) => ipcRenderer.invoke('save-api-key', key),
    getAPIKey: () => ipcRenderer.invoke('get-api-key')
})