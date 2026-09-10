
export class UploadPostActionInput {
    constructor(
        public readonly filePath: string, 
        public readonly tags: string[], 
        public readonly sources: string[], 
        public readonly rating:'s'|'q'|'e',
        public readonly options: {
            description?: string,
            parentId?: string,
            asPending: boolean
        }
    ) {}
}

export class UploadPostActionResult {
    constructor(
        public readonly location: string, 
        public readonly post_id: number
    ) {}
}

import {NetworkError, ApiError, RateLimitError} from './Errors.js'
import {getHeaders} from '../api.js'
import {readFile} from 'node:fs/promises'
import { QueueManager } from './QueueManager.js'

export class UploadPostAction implements QueueAction<UploadPostActionInput, UploadPostActionResult> {
    id: string = QueueManager.assignID(this);
    type: string = "uploadPostAction";
    input: UploadPostActionInput;

    dependencies: string[]

    status: ActionStatus = "pending"
    result: UploadPostActionResult|undefined = undefined

    attempts: number = 0;
    maxAttempts: number = 3;

    nextAttemptAt?: number = undefined;
    error?: QueueError = undefined;

    constructor(input: UploadPostActionInput, dependencies: string[]) {
        this.input = input;
        this.dependencies = dependencies;
    }

    async execute(): Promise<UploadPostActionResult> {
        
        // Taking all of the data from the input and turning it into the acceptable 
        // format that the endpoint expects
        const formData = new FormData();
        const fileBytes = await readFile(this.input.filePath)
        const file = new File([fileBytes], 'uploaded_file')

        formData.append('upload[file]', file)

        const urlEncodedSources = this.input.sources.join('%0A')

        formData.append('upload[source]', urlEncodedSources)
        formData.append('upload[tag_string]', this.input.tags.join(' '))
        formData.append('upload[rating]', this.input.rating)
        
        if (this.input.options.description) formData.append('upload[description]', this.input.options.description)
        if (this.input.options.parentId) formData.append('upload[parent_id]', this.input.options.parentId)

        const headers = getHeaders()

        // Networking and error management

        let response: Response;

        try {
            response = await fetch(`https://e621.net/uploads.json`, {
                method: "POST",
                body: formData,
                headers: headers
            })

        } catch (err) {
            console.log(err)
            throw new NetworkError("Network Error");
        }

        if (response.status === 429) {
            throw new RateLimitError(Date.now() + 3600 * 1000)
        }

        if(!response.ok) {
            throw new ApiError(response.status, "The API rejected the post")
        }


        const jsonResponse = await response.json()
        
        if (jsonResponse?.reason) {
            throw new ApiError(response.status, jsonResponse.reason)
        }
        
        return new UploadPostActionResult(jsonResponse.location, jsonResponse.post_id)
    }
}