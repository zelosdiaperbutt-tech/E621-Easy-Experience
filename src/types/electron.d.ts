export {};

declare global {
    interface Window {
        electronAPI: {
            getFilePath(file: File): string;
            fileSelectDialog(): Promise<FileInfo[]>
        }
    }

    type FileInfo = {
        path: string,
        name: string,
        type: string,
        size: number
    };
}