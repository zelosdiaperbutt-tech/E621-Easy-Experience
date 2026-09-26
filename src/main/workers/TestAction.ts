export class TestActionInput {
    constructor(
        public readonly willSucceed: boolean,
        public value: number,
        public readonly throwsError: boolean
    ) {}

    serialize() {
        return {
            willSucceed: this.willSucceed,
            value: this.value,
            throwsError: this.throwsError
        }
    }
}

export class TestActionResult {
    constructor (
        public readonly value: number,
        public readonly success: boolean
    ) {}
}


import {ApiError} from './Errors.js'
import { assignID } from './QueueManager.js'

export class TestAction implements QueueAction<TestActionInput, TestActionResult> {
    id: string = assignID(this)
    type: string = "testAction"
    input: TestActionInput;
    dependencies: Dependency[];
    status: ActionStatus = "pending"
    result: TestActionResult|undefined = undefined;

    attempts: number = 0;
    maxAttempts: number = 3;

    nextAttemptAt?: number = undefined;
    error?: QueueError = undefined;

    static deserialize(s: any): TestAction {
        const testInput = new TestActionInput(s.input.willSucceed, s.input.value, s.input.throwsError)
        let testAction = new TestAction(testInput, s.dependencies);

        testAction.id = s.id;
        testAction.status = s.status;
        testAction.attempts = s.attempts;
        testAction.maxAttempts = s.maxAttempts;
        testAction.nextAttemptAt = s.nextAttemptAt;
        testAction.error = s.error;
        testAction.result = s.result;

        return testAction;
    }

    constructor(input: TestActionInput, dependencies: Dependency[]) {
        this.input = input;
        this.dependencies = dependencies;
    }

    async execute(): Promise<TestActionResult> {

        const isReady = this.dependencies.every(dep => dep.resolved)
        if (!isReady) {
            throw new Error('dependencies not finished')
        }

        if (this.input.throwsError) {
            throw new ApiError(429, "Network Error")
        }

        return new TestActionResult(this.input.value, this.input.willSucceed)
    }

    serialize() {
        return {
            type: this.type,
            id: this.id,
            input: this.input.serialize(),
            dependencies: this.dependencies,
            status: this.status.toString(),
            result: this.result,
            attempts: this.attempts,
            maxAttempts: this.maxAttempts,
            nextAttemptAt: this.nextAttemptAt,
            error: this.error
        }
    }
}