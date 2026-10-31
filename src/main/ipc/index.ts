import { registerUserHandlers } from './user-handlers';
import { registerDialogHandlers } from './dialog-handlers';
import { registerQueueHandlers } from './queue-handlers';
import { registerImageHandlers } from './image-handlers';
import { registerItemHandlers } from './item-handlers';

export function registerIpcHandlers(): void {
    registerUserHandlers();
    registerDialogHandlers();
    registerQueueHandlers();
    registerImageHandlers();
    registerItemHandlers();
}