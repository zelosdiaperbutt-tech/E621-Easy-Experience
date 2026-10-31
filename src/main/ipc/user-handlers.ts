import { ipcMain } from 'electron'
import * as saveSecure from '../workers/saveSecure'

export function registerUserHandlers(): void {
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
}