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

contextBridge.exposeInMainWorld('api', {
    createPost: (filePath: string, tags: string, sources: string[], rating: 's'|'q'|'e', description:string="", parentId:string|null) => ipcRenderer.invoke('api-create-post', filePath, tags, sources, rating, description, parentId)
})

contextBridge.exposeInMainWorld('electronAPI', {
    getFilePath: (file: File): string => { return webUtils.getPathForFile(file); },
    fileSelectDialog: (): Promise<FileInfo[]> => ipcRenderer.invoke('dialog:file-select')
})