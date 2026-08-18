
import { getAPIKey, getUsername } from './workers/saveSecure'
import { readFile } from "node:fs/promises"


const getHeaders = () => {
    return {
        "Authorization": "Basic " + btoa(`${getUsername()}:${getAPIKey()}`),
        "User-Agent": "E621EasyExperience/1.0 (by zelosdiaperbutt on e621)"
    }
}


/**
 * Uploads a file from disk to e621.
 * 
 * @param filePath The path to the file on disk
 * @param tags A space separated string of tags for the post
 * @param sources A list of sources for the post, the maximum allowed is 10
 * @param rating 's' for Safe, 'q' for Questionable, and 'e' for Explicit
 * @param description A string that will go in the description of the post
 * @param parentId Optional, the parent if of the post is there is going to be one
 * @returns 
 */
export const createPost = async (filePath: string, tags: string, sources: string[], rating: 's'|'q'|'e', description:string = "", parentId:number|null) => {

    const formData = new FormData();
    
    const fileBytes = await readFile(filePath)

    const file = new File(
        [fileBytes],
        'uploaded_file'
    )

    formData.append('upload[file]', file)
    
    
    const urlEncodedSources = sources.join("%0A");  // Joins the sources together with url-encoded newline, as per specification
    
    formData.append('upload[source]', urlEncodedSources)
    formData.append('upload[tag_string]', tags)
    formData.append('upload[rating]', rating),
    formData.append('upload[description]', description)

    if (parentId) formData.append('upload[parent_id]', parentId.toString())

    const headers = getHeaders()

    console.log(headers)

    const response = await fetch(`https://e621.net/uploads.json`, {
        method: "POST",
        body: formData,
        headers: headers
    })

    const jsonResponse = await response.json()
    console.log(jsonResponse)

    return jsonResponse
}