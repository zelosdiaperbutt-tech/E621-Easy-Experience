export class TestActionInput {
    constructor(
        public readonly willSucceed: boolean,
        public readonly value: number,
        public readonly throwsError: boolean
    ) {}
}

export class TestActionResult {
    constructor (
        public readonly value: number,
        public readonly success: boolean
    ) {}
}


import {NetworkError, ApiError, RateLimitError} from './Errors.js'
import { assignID } from './QueueManager.js'

export class TestAction implements QueueAction<TestActionInput, TestActionResult> {
    id: string = assignID(this)
    type: string = "testAction"
    input: TestActionInput;
    dependencies: string[];
    status: ActionStatus = "pending"
    result: TestActionResult|undefined = undefined;

    attempts: number = 0;
    maxAttempts: number = 3;

    nextAttemptAt?: number = undefined;
    error?: QueueError = undefined;

    constructor(input: TestActionInput, dependencies: string[]) {
        this.input = input;
        this.dependencies = dependencies;
    }

    async execute(): Promise<TestActionResult> {
        if (this.input.throwsError) {
            throw new ApiError(429, "Network Error")
        }

        return new TestActionResult(this.input.value, this.input.willSucceed)
    }
}