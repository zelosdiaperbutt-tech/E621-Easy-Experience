
enum Gender {
    Male = "male",
    Female = "female",
    Andromorph = "andromorph",
    Gynomorph = "gynomorph",
    Hermaphrodite = "hermaphrodite",
    MaleHerm = "male-herm",
    Ambiguous = "ambiguous"
}

enum Relations {
    MM = "m/m",
    MF = "m/f",
    MAnd = "m/and",
    MGyn = "m/gyn",
    MHerm = "m/herm",
    MMherm = "m/mherm",
    MAmb = "m/amb",
    FF = "f/f",
    FAnd = "f/and",
    FGyn = "f/gyn",
    FHerm = "f/herm",
    FMherm = "f/mherm",
    FAmb = "f/amb",
    AndAnd = "and/and",
    AndGyn = "and/gyn",
    AndHerm = "and/herm",
    AndMherm = "and/mherm",
    AndAmb = "and/amb",
    GynGyn = "gyn/gyn",
    GynHerm = "gyn/herm",
    GynMherm = "gyn/mherm",
    GynAmb = "gyn/amb",
    HermHerm = "herm/herm",
    HermMherm = "herm/mherm",
    HermAmb = "herm/amb",
    MhermMherm = "mherm/mherm",
    MhermAmb = "mherm/amb",
    AmbAmb = "amb/amb"
}

enum SpeciesType {
    Anthro = "anthro",
    Feral = "feral",
    Humanoid = "humanoid",
    Human = "human",
    Taur = "taur"
}

enum NumberOfCharacters {
    Zero = "zero",
    Solo = "solo",
    Duo = "duo",
    Trio = "trio",
    Group = "group",
    Unset = "unset"
}

const genderToTag = (g: Gender): string => {
    if (g === Gender.Ambiguous) return "ambiguous_gender"
    if (g === Gender.MaleHerm) return "maleherm"

    return g.toString();
}

const relationsToTag = (r: Relations): string => {
    const map = new Map<Relations, string>([
        [Relations.MM, "male/male"],
        [Relations.MF, "male/female"],
        [Relations.MAnd, "andromorph/male"],
        [Relations.MGyn, "gynomorph/male"],
        [Relations.MHerm, "herm/male"],
        [Relations.MMherm, "maleherm/male"],
        [Relations.MAmb, "male/ambiguous"],
        [Relations.FF, "female/female"],
        [Relations.FAnd, "andromorph/female"],
        [Relations.FGyn, "gynomorph/female"],
        [Relations.FHerm, "herm/female"],
        [Relations.FMherm, "maleherm/female"],
        [Relations.FAmb, "female/ambiguous"],
        [Relations.AndAnd, "andromorph/andromorph"],
        [Relations.AndGyn, "andromorph/gynomorph"],
        [Relations.AndHerm, "andromorph/hermaphrodite"],
        [Relations.AndMherm, "maleherm/andromorph"],
        [Relations.AndAmb, "andromorph/ambiguous"],
        [Relations.GynGyn, "gynomorph/gynomorph"],
        [Relations.GynHerm, "gynomorph/hermaphrodite"],
        [Relations.GynMherm, "maleherm/gynomorph"],
        [Relations.GynAmb, "gynomorph/ambiguous"],
        [Relations.HermHerm, "herm/herm"],
        [Relations.HermMherm, "maleherm/herm"],
        [Relations.HermAmb, "herm/ambiguous"],
        [Relations.MhermMherm, "maleherm/maleherm"],
        [Relations.MhermAmb, "maleherm/ambiguous"],
        [Relations.AmbAmb, "ambiguous/ambiguous"]
    ]);

    return map.get(r) ?? "";
}

const speciesTypeToTag = (sT: SpeciesType): string => {
    return sT.toString()
}

const numberOfCharactersToTag = (n: NumberOfCharacters): string => {
    if (n === NumberOfCharacters.Unset) return ""
    if (n === NumberOfCharacters.Zero) return "zero_pictured"

    return n.toString()
}


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

    static convert(item: UploadItem, asPending: boolean = true): UploadPostActionInput {
        if (item.rating === 'u') throw new Error('Rating is a required property')
        if (item.path === "") throw new Error('File path is a required property')
        

        let tags: string[] = []
        tags = tags.concat(item.creators)
                    .concat(item.characters)
                    .concat(item.genders.map(g => genderToTag(g)))
                    .concat(item.species)
                    .concat(item.general)
                    .concat(item.relations.map(r => relationsToTag(r)))
                    .concat(item.speciesTypes.map(st => speciesTypeToTag(st)))
                    .concat(numberOfCharactersToTag(item.numberOfCharacters))

        return new UploadPostActionInput(item.path, tags, item.sources, item.rating, {
            description: item.description,
            parentId: item.parent,
            asPending
        })
    }
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

        if (response.status === 503) {
            throw new RateLimitError(Date.now() + 1 * 1000)
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