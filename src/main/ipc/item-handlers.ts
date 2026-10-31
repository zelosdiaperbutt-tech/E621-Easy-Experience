import { ipcMain } from 'electron'

import { advanceCounter } from '../services/postIds'
import * as unfinishedItems from '../services/unfinishedItems'

export function registerItemHandlers(): void {


    ipcMain.handle('get-id', async () => {
        return advanceCounter()
    })

    ipcMain.handle('unfinished:save', (_, items: UploadItemInfo[]) => {
        unfinishedItems.save(items)
    })

    ipcMain.handle('unfinished:load', () => {
        return unfinishedItems.load();
    })
}