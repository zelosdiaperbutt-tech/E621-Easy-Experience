import {app} from 'electron'
import fs from "node:fs"
import path from 'node:path'

const UNFINISHED_ITEM_PATH = path.join(app.getPath('userData'), 'unfinishedPosts.json')

export const load = (): UploadItemInfo[] => {
    try {
        const data = fs.readFileSync(UNFINISHED_ITEM_PATH, 'utf-8');
        const json = JSON.parse(data)
        return json.items;
    } catch (err: any) {
        if (err.code === "ENOENT") {
            console.log("Unfinished Items files does not exist, creating")
            fs.writeFileSync(UNFINISHED_ITEM_PATH, JSON.stringify({items: []}), 'utf-8')
            return [];
        }

        throw err;
    }
}

export const save = (items: UploadItemInfo[]) => {
    fs.writeFileSync(UNFINISHED_ITEM_PATH, JSON.stringify({items: items}), 'utf-8')
}