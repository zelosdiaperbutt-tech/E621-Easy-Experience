import { ipcMain, dialog } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

const IMAGE_EXTENSIONS = ['png', 'apng', 'pjp', 'jfif', 'jpe', 'pjpeg', 'jpeg', 'jpg', 'webp'];
const VIDEO_EXTENSIONS = ['webm', 'gif', 'm4v', 'mp4'];
const ALL_EXTENSION = IMAGE_EXTENSIONS.concat(VIDEO_EXTENSIONS);

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
                { name: 'All', extensions: ALL_EXTENSION },
                { name: 'Images', extensions: IMAGE_EXTENSIONS },
                { name: 'Videos', extensions: VIDEO_EXTENSIONS }
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