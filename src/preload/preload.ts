import { contextBridge, ipcRenderer, webUtils } from "electron";

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})

contextBridge.exposeInMainWorld('saveSecure', {
    saveAPIKey: (key: string) => ipcRenderer.invoke('save-api-key', key),
    getAPIKey: () => ipcRenderer.invoke('get-api-key'),
    saveUsername: (username: string) => ipcRenderer.invoke('save-username', username),
    getUsername: () => ipcRenderer.invoke('get-username')
})


contextBridge.exposeInMainWorld('electronAPI', {
    getFilePath: (file: File): string => { return webUtils.getPathForFile(file); },
    fileSelectDialog: (): Promise<FileInfo[]> => ipcRenderer.invoke('dialog:file-select')
}),

contextBridge.exposeInMainWorld('uploadItems', {
    getID: (): Promise<number> => ipcRenderer.invoke('get-id')
})

contextBridge.exposeInMainWorld('queue', {
    addUploadItem: (item: UploadItemInfo, dependencies: string[], asPending: boolean = true): Promise<string> => {
        console.log(item)
        return ipcRenderer.invoke('queue:newUploadAction', item, dependencies, asPending)
    }
})