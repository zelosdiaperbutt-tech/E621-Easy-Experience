
import { getAPIKey, getUsername } from './workers/saveSecure'
import { readFile } from "node:fs/promises"


export const getHeaders = () => {
    return {
        "Authorization": "Basic " + btoa(`${getUsername()}:${getAPIKey()}`),
        "User-Agent": "E621EasyExperience/1.0 (by zelosdiaperbutt on e621)"
    }
}