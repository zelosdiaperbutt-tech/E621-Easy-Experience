
// import { ImageUploadItem } from "../../components/imageUploadItem.js";
// import { VideoUploadItem } from "../../components/videoUplaodItem.js";

/**
 * Handles the creation, deletion, and selection of items while they are in the
 * grid.
 */
class ItemManager {

    selectedItems: UploadItem[] = [];


    addToSelection(item: UploadItem, callback?: (selected: UploadItem[]) => void) {
        if (!this.selectedItems.includes(item)) {
            this.selectedItems.push(item)

            callback?.(this.selectedItems);
        }
    }

    removeFromSelection(item: UploadItem, callback?: (selected: UploadItem[]) => void) {
        const index = this.selectedItems.indexOf(item);
        if (index !== -1) {
            this.selectedItems.splice(index, 1)

            callback?.(this.selectedItems);
        }
    }

    deleteAllSelected(callback?: () => void) {
        while (this.selectedItems.length > 0) {
            const currentItem = this.selectedItems[0]
            this.removeFromSelection(currentItem)
            if (currentItem instanceof HTMLElement) {
                currentItem.remove()
            }
        }

        callback?.()
    }

    /**
     * Using the specified file object, creates the appropriate element
     * for the file's type and appends it at the end of the specified parent
     * element.
     * 
     * @param parentElement The element that will become the parent of the created uploadItem
     * @param file The file object containing all the necessary information to initially create
     * the item
     * @returns 
     */
    async createFromFile(parentElement: HTMLElement, file: File) {
        const cleanedType = this.cleanType(file.type);
        console.log(cleanedType)
        const mediaType = this.mediaTypeOfFile(cleanedType);
        console.log(mediaType)
        if (mediaType === "unknown") return;

        const path = window.electronAPI.getFilePath(file);

        let uploadElement: HTMLElement = await this.getUploadItemCreationFunction(mediaType)(path, file.name, cleanedType, file.size)

        parentElement.insertAdjacentElement('beforeend', uploadElement)
        console.log('Item appended')
    }

    /**
     * Using the specified FileInfo object, creates the appropriate element
     * for the file's type and appends it at the end of the specified parent
     * element.
     * 
     * @param parentElement The element that will become the parent of the created uploadItem
     * @param info The FileInfo object containing all the necessary information to initially create
     * the item
     * @returns 
     */
    async createFromFileInfo(parentElement: HTMLElement, info: FileInfo) {
        const cleanedType = this.cleanType(info.type);
        const mediaType = this.mediaTypeOfFile(cleanedType);
        if (mediaType === 'unknown') return;

        let uploadElement: HTMLElement = await this.getUploadItemCreationFunction(mediaType)(info.path, info.name, cleanedType, info.size)

        parentElement.insertAdjacentElement('beforeend', uploadElement);
    }

    /**
     * Cleans up the provided type information to give only the text after
     * the last '.' and '/'. Used to clean up the types that are given
     * as default from Electron and Chromium file checks.
     * 
     * @param type The initial type/extension.
     * @returns The type/extention cleaned up to include only the last section
     */
    private cleanType(type: string): string {
        let intermediate1 = type.substring(type.lastIndexOf('.') + 1);
        return intermediate1.substring(intermediate1.lastIndexOf('/') + 1);
    }

    /**
     * Given the name of a file extension, returns whether that extension is
     * a known image format, video format, or neither (marked as 'unknown').
     * Checks are not exhaustive.
     * 
     * @param extName The name of the extension
     * @returns Whether the extension indicated an image, video, or neither.
     */
    private mediaTypeOfFile(extName: string): 'image'|'video'|'unknown' {
        const IMAGE_FORMATS: string[] = ['png', 'apng', 'pjp', 'jfif', 'jpe', 'pjpeg', 'jpeg', 'jpg', 'webp'];
        const VIDEO_FORMATS: string[] = ['webm', 'gif', 'm4v', 'mp4', 'webp', 'matroska'];

        if (IMAGE_FORMATS.includes(extName)) return 'image';
        if (VIDEO_FORMATS.includes(extName)) return 'video';

        return 'unknown';
    }

    /**
     * Helper function used to more cleanly determine which item creation function
     * should be used.
     * 
     * @param type The media type of the item that's going to be created. Dictates the
     * function that will be returned. 
     * @returns The item creation function.
     */
    private getUploadItemCreationFunction(type: 'image'|'video'): (path: string, name: string, type: string, size: number) => Promise<HTMLElement> {
        switch(type) {
            case 'image':
                return this.createImageUploadItem;
            case 'video':
                return this.createVideoUploadItem;
        }
    }

    /**
     * The specific creation function that creates the ImageUploadItem.
     * 
     * @param path The path to the file
     * @param name The file's name, will be displayed on the element
     * @param type The type that will be displayed on the element
     * @param size The size of the file in bytes, which will be tidied
     * before being displayed.
     * @returns The ImageUploadItem
     */
    private async createImageUploadItem(path: string, name: string, type: string, size: number): Promise<HTMLElement> {
        const item = document.createElement('image-item')
        item.setAttribute('path', path)
        item.setAttribute('name', name)
        item.setAttribute('type', type)
        item.setAttribute('size', size.toString())
        item.setAttribute('item-id', (await window.uploadItems.getID()).toString())
        return item;
    }

    /**
     * The specific creation function that creates a VideoUploadItem
     * 
     * @param path The path to the file
     * @param name The file's name, which will be displayed on the element
     * @param type The file's type, which will be displayed on the element
     * @param size The size of the file in bytes, which will be tidied
     * before being displayed.
     * @returns The VideoUploadItem
     */
    private async createVideoUploadItem(path: string, name: string, type: string, size: number): Promise<HTMLElement> {
        const item = document.createElement('video-item')
        item.setAttribute('path', path)
        item.setAttribute('name', name)
        item.setAttribute('type', type)
        item.setAttribute('size', size.toString())
        item.setAttribute('item-id', (await window.uploadItems.getID()).toString())
        return item;
    }
}

export const itemManager = new ItemManager()