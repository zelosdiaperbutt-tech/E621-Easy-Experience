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

    
}