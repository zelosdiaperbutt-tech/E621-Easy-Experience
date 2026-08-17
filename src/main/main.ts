import {app, BrowserWindow, ipcMain} from 'electron'
import path from 'node:path'


// This is going to be replaced with a better system in the future, only testing for right now.
let firstOpen = true;
const initialPage = (hasBeenSetup: boolean): string => {
    return hasBeenSetup ? path.join(__dirname, "../renderer/pages/startup/index.html") : path.join(__dirname, "../renderer/pages/home/index.html");
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js')
        }
    })

    win.loadFile(initialPage(firstOpen));
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})