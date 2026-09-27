
import { getAPIKey, getUsername } from './saveSecure';
import { TestAction } from './TestAction';

export class UserLoginDependency implements Dependency {
    constructor (
        public resolved: boolean = false
    ) {}

    async attemptResolution(context: ActionContext, attachedAction: QueueAction): Promise<boolean> {
        
        const apiKey = getAPIKey()
        const username = getUsername();

        if (
            !apiKey ||
            !username ||
            apiKey.length === 0 ||
            username.length === 0
        ) {
            attachedAction.attempts = attachedAction.maxAttempts + 1;
            attachedAction.status = 'failed';
            return false;
        }

        this.resolved = true;
        return true;
    }
}