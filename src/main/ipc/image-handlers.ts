import { ipcMain, app } from 'electron'
import { downloadImage } from '../services/downloadImage';
import { remapBlueskyImageUrl, selectBestImage } from '../services/selectBestImage';

export function registerImageHandlers(): void {

    ipcMain.handle('url-conversion:download-bluesky', (_, url: string) => {
        const data = url.match(/did\:plc\:\w+\/\w+$/)
        if (!data) return null;
        const str = data[0];
        const slashIndex = str.indexOf('/')
        const first = str.substring(0, slashIndex)
        const second = str.substring(slashIndex + 1)

        const resolvedPath = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${first}&cid=${second}`
        return downloadImage(resolvedPath, second);
    })

    ipcMain.handle('image-select-best', async (_, urls: string[]) => {
        const properUrls = urls.map(remapBlueskyImageUrl)
        const result = await selectBestImage(properUrls, {keepDir: app.getPath('desktop')})
        console.log(result);
        return true
    })
}