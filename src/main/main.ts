import {app, BrowserWindow, ipcMain} from 'electron'
import path from 'node:path'

import './ipcHandlers'
import * as postIds from './services/postIds'

const OPENING_PAGE = path.join(__dirname, "../renderer/pages/home/index.html")

const initialize = async () => {
    await postIds.loadCounter()
}

const denitialize = async () => {
    await postIds.saveCounter()
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js')
        }
    })

    win.loadFile(OPENING_PAGE);
}

app.whenReady().then(() => {
    initialize()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    denitialize()
    
    if (process.platform !== 'darwin') app.quit()
})