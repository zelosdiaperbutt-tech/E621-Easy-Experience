import {app} from 'electron'
import fs from "node:fs"
import path from "node:path"

import {TestAction} from './TestAction'

/**
 * @unfinished
 */
class QueueStorage {
    private readonly filePath: string;

    constructor() {
        this.filePath = path.join(
            app.getPath('userData'),
            'queue.json'
        )
    }

    async save(actions: QueueAction[]): Promise<void> {
        const data = {
            version: 1,
            actions: actions.map(a => a.serialize())
        }

        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
    }

    async load(): Promise<QueueAction[]> {
        try {
            const contents = fs.readFileSync(this.filePath, 'utf-8')

            const data = JSON.parse(contents)

            return data.actions.map(
                (actionData: any) => this.deserializeAction(actionData)
            )
        } catch (error:any) {
            if (error.code === "ENOENT") {
                return [];
            }

            throw error;
        }
    }

    private deserializeAction(data: any): QueueAction {
        switch(data.type) {
            case "testAction":
                return TestAction.deserialize(data)
                break;

            default:
                throw new Error(`Unknown action type: ${data.type}`)
        }
    }
}

export const queueStorage = new QueueStorage()