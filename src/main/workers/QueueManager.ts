import { Network } from "node:inspector/promises";
import { RateLimitError, NetworkError, ApiError } from "./Errors";

export class QueueManager implements ActionContext {

    static assignID(action: QueueAction): string {
        return Date.now().toString()
    }

    private actions = new Map<string, QueueAction>();

    add(action: QueueAction): void {
        this.actions.set(action.id, action)
    }

    get(id: string): QueueAction | undefined {
        return this.actions.get(id);
    }

    /**
     * 
     * Gets the returned result from a previous action cast as the type
     * specified.
     * 
     * @param actionId Which action you want the result from
     * @returns The result of the action
     * @throws When there is no known action with that ID, or the
     * status of that action is not "completed".
     */
    getResult<T>(actionId: string): T {
        const action = this.actions.get(actionId);

        if (!action) {
            throw new Error(
                `Action ${actionId} does not exist`
            )
        }

        if (action.status !== 'completed') {
            throw new Error(
                `Action ${actionId} has not completed`
            )
        }

        return action.result as T;
    }

    /**
     * Determines whether the specified action's dependencies have
     * all been marked as "completed".
     * 
     * @param action The action to check.
     * @returns Whether all dependencies are satisfied or not.
     */
    private dependenciesSatisfied(
        action: QueueAction
    ): boolean {
        return action.dependencies.every(id => {
            const dependency = this.actions.get(id)

            return dependency?.status === "completed"
        })
    }


    /**
     * 
     * Determines whether an action is ready to be executed.
     * 
     * @param action The action to check
     * @returns Whether the action is ready.
     */
    private isReady(action: QueueAction): boolean {
        if (action.status !== "pending") {
            return false;
        }

        if (!this.dependenciesSatisfied(action)) {
            return false;
        }

        if (
            action.nextAttemptAt !== undefined &&
            Date.now() < action.nextAttemptAt
        ) {
            return false;
        }

        return true;
    }

    async process(): Promise<void> {
        while (true) {
            const action = [...this.actions.values()]
                .find(action => this.isReady(action));

            if (!action) break;

            await this.execute(action);
        }
    }

    private async execute(action: QueueAction): Promise<void> {
        action.status = "running";
        action.attempts++;

        try {
            const result = await this.executeAction(action)

            action.result = result;
            action.status = "completed"

            console.log(`Action ${action.id} completed`)

        } catch (err) {
            console.log("Error in execute:", err)
            await this.handleError(action, err);
        }
    }

    private async executeAction(
        action: QueueAction
    ): Promise<unknown> {

        return action.execute()
    }

    private async handleError(
        action: QueueAction,
        error: unknown
    ): Promise<void> {
        // check is the error is an instance of an error class and handle things
        // with the action appropriately.
        console.log(error)

        if (error instanceof RateLimitError) {
            action.status = "waiting";
            action.nextAttemptAt = error.retryAt

            return;
        }

        if (error instanceof NetworkError) {
            action.status = "pending"
            return;
        }

        if (error instanceof ApiError) {
            if (error.statusCode >= 500 && action.attempts < action.maxAttempts) {
                action.status = "pending"
            } else {
                action.status = "failed"
            }

            return;
        }
    }
}