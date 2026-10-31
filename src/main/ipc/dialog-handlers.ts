import { ipcMain, dialog } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

export function registerDialogHandlers(): void {
    ipcMain.handle('dialog:file-select', async () => {
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

        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'All', extensions: ['png', 'apng', 'pjp', 'jfif', 'jpe', 'pjpeg', 'jpeg', 'jpg', 'webp', 'webm', 'gif', 'm4v', 'mp4', 'webp'] },
                { name: 'Images', extensions: ['png', 'apng', 'pjp', 'jfif', 'jpe', 'pjpeg', 'jpeg', 'jpg', 'webp'] },
                { name: 'Videos', extensions: ['webm', 'gif', 'm4v', 'mp4'] }
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
}