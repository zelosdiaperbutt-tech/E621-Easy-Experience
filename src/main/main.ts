import {app, BrowserWindow, ipcMain} from 'electron'
import path from 'node:path'


import './ipcHandlers'
import * as postIds from './services/postIds'


// Testing queueManager
import {QueueManager} from './workers/QueueManager.js'
import { UploadPostAction, UploadPostActionInput, UploadPostActionResult } from './workers/UploadPostAction'

const qm: QueueManager = new QueueManager()
const postInput = new UploadPostActionInput(
    "C://shutup/articulations.jpg",
    ["diaper", "fart"],
    [],
    "s",
    {description: "", parentId: "", asPending: true}
)
const postAction = new UploadPostAction(postInput, [])
qm.add(postAction)

qm.process()


// This is going to be replaced with a better system in the future, only testing for right now.
let firstOpen = false;
const initialPage = (hasBeenSetup: boolean): string => {
    return hasBeenSetup ? path.join(__dirname, "../renderer/pages/startup/index.html") : path.join(__dirname, "../renderer/pages/upload/index.html");
}

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

    win.loadFile(initialPage(firstOpen));
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