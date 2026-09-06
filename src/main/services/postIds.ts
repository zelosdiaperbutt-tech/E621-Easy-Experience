import {app} from 'electron'
import fs from 'node:fs'
import path from 'node:path'

const idCounterPath = path.join(app.getPath('userData'), 'idcounter.json')

let counterValue: number;

export const saveCounter = async () => {
    await fs.writeFileSync(idCounterPath, JSON.stringify({counter: counterValue}), 'utf-8')
}

export const loadCounter = async () => {
    try {
        const data = await fs.readFileSync(idCounterPath, 'utf-8');
        const json = JSON.parse(data)
        counterValue = json.counter;
    } catch (err: any) {
        if (err.code === "ENOENT") {
            console.log("File doesn't exist, creating");
            await fs.writeFileSync(idCounterPath, "{counter: 1}", 'utf-8')
            counterValue = 1;
            return;
        }

        throw err;
    }
}

export const advanceCounter = (): number => {
    const current = counterValue;
    counterValue++;
    return current;
}