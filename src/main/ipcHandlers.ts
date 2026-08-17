import { ipcMain } from 'electron'

import * as saveSecure from './workers/saveSecure'

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