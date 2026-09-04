import { ipcMain, dialog } from 'electron'

import fs from 'node:fs';
import {stat} from 'node:fs/promises'
import path from 'node:path';

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



async function getFileSize(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(stats.size)
        })
    })
}

ipcMain.handle('dialog:file-select', async () => {
    const {canceled, filePaths} = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
            {name: 'Images', extensions: ['png', 'apng', 'pjp', 'jfif', 'jpe', 'pjpeg', 'jpeg', 'jpg', 'webp']},
            {name: 'Videos', extensions: ['webm', 'gif', 'm4v', 'mp4', 'webp']}
        ]
    });

    if (canceled) return [];

    let fileInfo: FileInfo[] = [];

    for (let i = 0; i < filePaths.length; i++) {
        fileInfo.push({
            name: path.basename(filePaths[i]),
            path: filePaths[i],
            size: await getFileSize(filePaths[i]),
            type: path.extname(filePaths[i])
        })
    }

    return fileInfo;
})