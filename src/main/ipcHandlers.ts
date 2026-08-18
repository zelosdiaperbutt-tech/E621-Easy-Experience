import { ipcMain } from 'electron'

import * as saveSecure from './workers/saveSecure'
import * as api from './api'

ipcMain.handle('save-api-key', async (_, key: string) => {
    try {
        saveSecure.saveAPIKey(key);
        return true;
    } catch (e) {
        return false;
    }
})

ipcMain.handle('get-api-key', async () => {
    return saveSecure.getAPIKey();
})

ipcMain.handle('save-username', async (_, username: string) => {
    try {
        saveSecure.saveUsername(username)
        return true;
    } catch (e) {
        return false;
    }
})

ipcMain.handle('get-username', async () => {
    return saveSecure.getUsername()
})


ipcMain.handle('api-create-post', async (_, filePath, tags, sources, rating, description, parentId) => {
    return api.createPost(filePath, tags, sources, rating, description, parentId)   // Calling the createPost function directly will not go on forever, the queue will eventually take its place.
})