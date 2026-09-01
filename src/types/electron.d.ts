export {};

declare global {
    interface Window {
        electronAPI: {
            getFilePath(file: File): string;
            fileSelectDialog(): Promise<FileInfo[]>;
        }
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

    enum Gender {
        Male = "male",
        Female = "female",
        Andromorph = "andromorph",
        Gynomorph = "gynomorph",
        Hermaphrodite = "hermaphrodite",
        MaleHerm = "maleherm",
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