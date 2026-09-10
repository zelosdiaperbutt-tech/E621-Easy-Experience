
export class UploadPostActionInput {
    tags: string[];
    filePath: string;
    rating: 's'|'q'|'e';
    sources: string[];
    description?: string;
    parentId?: string; // E621 ID of the parent, not local ID.
    asPending: boolean = true;

    constructor(
        filePath: string, 
        tags: string[], 
        sources: string[], 
        rating:'s'|'q'|'e',
        options: {
            description?: string,
            parentId?: string,
            asPending: boolean
        }) {
        
        this.tags = tags;
        this.filePath = filePath
        this.sources = sources;
        this.rating = rating;
        this.description = options.description
        this.parentId = options.parentId
        this.asPending = options.asPending
    }
}

export class UploadPostActionResult {
    success: boolean;
    location: string;
    post_id: number;
    reason?: string; // only appears if success is false

    constructor(success: boolean, location: string, post_id: number, reason?: string) {
        this.success = success;
        this.location = location;
        this.post_id = post_id
        this.reason = reason
    }
}

import {getHeaders} from '../api.js'
import {readFile} from 'node:fs/promises'

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

    async execute(queueManager: QueueManager): Promise<UploadPostActionResult> {
        
        const formData = new FormData();
        const fileBytes = await readFile(this.input.filePath)
        const file = new File([fileBytes], 'uploaded_file')

        formData.append('upload[file]', file)

        const urlEncodedSources = this.input.sources.join('%0A')

        formData.append('upload[source]', urlEncodedSources)
        formData.append('upload[tag_string]', this.input.tags.join(' '))
        formData.append('upload[rating]', this.input.rating)
        
        if (this.input.description) formData.append('upload[description]', this.input.description)
        if (this.input.parentId) formData.append('upload[parent_id]', this.input.parentId)

        const headers = getHeaders()

        try {
            const response = await fetch(`https://e621.net/uploads.json`, {
                method: "POST",
                body: formData,
                headers: headers
            })

            if (!response.ok) {
                console.log(response)
                // do something with incorrect response
            }

            const jsonResponse = await response.json()
            return new UploadPostActionResult(true, jsonResponse.location, jsonResponse.post_id)
        } catch (err) {
            console.log(err)
        }
        
        throw new Error("Not implemented");
    }
}