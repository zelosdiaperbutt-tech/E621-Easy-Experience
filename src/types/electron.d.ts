export {};

declare global {
    interface Window {
        electronAPI: {
            getFilePath(file: File): string;
            fileSelectDialog(): Promise<FileInfo[]>;
        }
    }

    interface UploadItem {
        get path(): string;
        get name(): string;
        get size(): number;
        get type(): string;

        get rating(r: 's'|'q'|'e'|'u');
        set rating(): 's'|'q'|'e'|'u';
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
}