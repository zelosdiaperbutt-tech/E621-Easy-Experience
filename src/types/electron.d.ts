export {};

declare global {
    interface Window {
        electronAPI: {
            getFilePath(file: File): string;
        }
    }
}