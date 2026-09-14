export class NetworkError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "NetworkError"
    }
}

export class ApiError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string
    ) {
        super(message)
        this.name = "ApiError"
    }
}

export class RateLimitError extends Error {
    constructor(
        public readonly retryAt: number,
        message: string = "Rate limit exceeded"
    ) {
        super(message);
        this.name = "RateLimitError"
    }
}