export {};

declare global {
    interface Window {
        electronAPI: {
            getFilePath(file: File): string;
            fileSelectDialog(): Promise<FileInfo[]>;
        }
        uploadItems: {
            getID(): Promise<number>;
        }
        queue: {
            addUploadItem(item: UploadItemInfo, dependencies: string[], asPending: boolean): Promise<string>;
        }
        storage: {
            items: {
                saveUnfinished(items: UploadItemInfo[]);
                loadUnfinished(): Promise<UploadItemInfo[]>;
            }
        }
    }

    interface UploadItem {
        get path(): string;
        get name(): string;
        get size(): number;
        get type(): string;

        set rating(r: 's'|'q'|'e'|'u');
        get rating(): 's'|'q'|'e'|'u';
        get creators(): string[];
        set creators(c: string[]);
        get sources(): string[];
        set sources(s: string[]);
        get characters(): string[];
        set characters(c: string[]);
        get genders(): Gender[];
        set genders(g: Gender[]);
        get species(): string[];
        set species(s: string[]);
        get general(): string[];
        set general(g: string[]);
        get parent(): string;
        set parent(p: string);
        get description(): string;
        set description(d: string);
        get relations(): Relations[];
        set relations(r: Relations[]);
        get speciesTypes(): SpeciesType[];
        set speciesTypes(sT: SpeciesType[]);
        get numberOfCharacters(): NumberOfCharacters;
        set numberOfCharacters(n: NumberOfCharacters);

        set state(s: UploadItemState);
        get state(): UploadItemState;

        toData(): UploadItemInfo;
    }

    enum UploadItemState {
        RequiredFieldsMissing = "requiredFieldsMissing",
        Unfinished = "unfinished",
        Draft = "draft",
        Ready = "ready"
    }

    type UploadItemInfo = {
        path: string;
        name: string;
        size: number;
        type: string;
        rating: 's'|'e'|'q'|'u';
        creators: string[];
        sources: string[]
        characters: string[]
        genders: Gender[];
        species: string[]
        general: string[]
        parent: string;
        description: string;
        relations: Relations[];
        speciesTypes: SpeciesType[];
        numberOfCharacters: NumberOfCharacters;
        state: UploadItemState;
        id: string;
        fileType?: 'image'|'video'
    }

    type FileInfo = {
        path: string,
        name: string,
        type: string,
        size: number
    };

    type Note = {
        x: number,
        y: number,
        width: number,
        height: number,
        text: string
    }

    type AutocompleteSuggestion = {
        antecedent_name: string | null,
        category: number,
        id: number,
        name: string,
        post_count: number
    }

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

    enum Rating {
        Safe = "s",
        Questionable = "q",
        Explicit = "e",
        Unset = "u"
    }

    enum TagType {
        Creator,
        Character,
        Gender,
        Species,
        General
    }

    type ActionStatus = 
        | "pending"
        | "running"
        | "waiting"
        | "completed"
        | "failed"

    type QueueError = 
        | {
            type: "rate-limit";
            retryAt: number;
        }
        | {
            type: "network";
            message: string;
        }
        | {
            type: "api";
            statusCode: number,
            message: string
        }
        | {
            type: "permanent";
            message: string;
        }
    
    interface QueueAction<TInput = unknown, TResult = unknown> {
        id: string;
        type: string;

        input: TInput;

        dependencies: string[]; // IDs of actions that must be completed first

        status: ActionStatus;

        result?: TResult; // Data returned by the action

        attempts: number;
        maxAttempts: number;

        nextAttemptAt?: number;
        error?: QueueError;

        execute(): Promise<TResult>;
        serialize(): {
            type: string,
            status: string,
            attempts: number,
            maxAttempts: number,
            dependencies: string[],
            nextAttemptAt: number|undefined
        };
    }

    interface ActionContext {
        getResult<T>(actionId: string): T;
    }
}