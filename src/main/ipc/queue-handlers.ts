
import { ipcMain } from 'electron'

import { queueManager } from '../workers/QueueManager'
import { UploadPostAction, UploadPostActionInput } from '../workers/UploadPostAction'
import { PostActionParentDependency } from '../workers/postActionParentDependency'

export function registerQueueHandlers(): void {
    ipcMain.handle('queue:newUploadAction', (_, item: UploadItemInfo, asPending: boolean, uploadActionParentId?: string) => {
        const input = UploadPostActionInput.convert(item, asPending)

        // dependencies are currently not being passed during 
        // test implemenation.
        const action = new UploadPostAction(input, [])
        if (uploadActionParentId) {
            action.dependencies.push(
                new PostActionParentDependency(uploadActionParentId, false)
            )
        }

        queueManager.add(action)
        return action.id;
    })
}
