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

contextBridge.exposeInMainWorld('storage', {
    items: {
        saveUnfinished: (items: UploadItemInfo[]) => ipcRenderer.invoke('unfinished:save', items),
        loadUnfinished: (): Promise<UploadItemInfo[]> => ipcRenderer.invoke('unfinished:load')
    }
})


contextBridge.exposeInMainWorld('electronAPI', {
    getFilePath: (file: File): string => { return webUtils.getPathForFile(file); },
    fileSelectDialog: (): Promise<FileInfo[]> => ipcRenderer.invoke('dialog:file-select')
}),

contextBridge.exposeInMainWorld('uploadItems', {
    getID: (): Promise<number> => ipcRenderer.invoke('get-id')
})

contextBridge.exposeInMainWorld('queue', {
    addUploadItem: (item: UploadItemInfo, asPending: boolean = true, uploadActionParentId?: string): Promise<string> => {
        return ipcRenderer.invoke('queue:newUploadAction', item, asPending, uploadActionParentId)
    }
})