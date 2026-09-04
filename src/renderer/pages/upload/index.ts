const selectedLabel = document.getElementById('bulkaction-total');
const bulkactionCheckbox = document.getElementById('bulkaction-checkbox') as HTMLInputElement;
const bulkactionDeleteButton = document.getElementById('bulkaction-delete') as HTMLButtonElement
const mainAreaFileDrop = document.getElementById('upload-main-area-file') as HTMLElement;
const uploadGrid = document.getElementById('upload-main-area-grid') as HTMLElement;
const sidebar = document.getElementById('upload-right-sidebar') as HTMLElement;
const bulkOptions = document.getElementById('bulkaction-options') as HTMLElement;


import {setCurrentUploadItem, updateModalInfo, activateModal} from './modal.js'
import {ImageUploadItem} from '../../components/imageUploadItem.js'
import { VideoUploadItem } from '../../components/videoUplaodItem.js';

// Selected upload elements
let selectedItems: HTMLElement[] = [];


/**
 * Adds an upload element to the list of selected items
 * @param element The element to add to the list
 */
export const addToSelected = (element: HTMLElement): void => {
    if (!selectedItems.includes(element)) {
        selectedItems.push(element)
        updateSelectionQuantityLabel()
    }
}

/**
 * Removes an upload element from the list of selected items.
 * @param element The element to be removed
 */
export const removeFromSelected = (element: HTMLElement): void => {
    const index = selectedItems.indexOf(element)
    if (index !== -1) {
        selectedItems.splice(index, 1);
        updateSelectionQuantityLabel()
    }
}

/**
 * 
 */
const deleteSelectedItems = (): void => {
    while (selectedItems.length > 0) {
        const currentItem = selectedItems[0];
        currentItem.dispatchEvent(new Event('become-deselected'))
        currentItem.remove()
    }

    updateSelectionQuantityLabel()
}

bulkactionDeleteButton.addEventListener('click', () => {
    deleteSelectedItems()
})

/**
 * Changes the text of the selection label on the bulk action bar to reflect
 * the total number of items and the amount of items that are currently selected.
 * @returns 
 */
const updateSelectionQuantityLabel = (): void => {
    const totalItems: number = document.querySelectorAll('.upload-item').length;
    const numberSelected: number = selectedItems.length;

    if (!selectedLabel) return;
    selectedLabel.innerText = `${numberSelected} of ${totalItems}`;
}


bulkactionCheckbox.addEventListener('change', (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (target.checked) {

        document.querySelectorAll<HTMLElement>('.upload-item').forEach((item) => {
            item.dispatchEvent(new Event('become-selected'))
        })

    } else if (!target.checked) {

        document.querySelectorAll<HTMLElement>('.upload-item').forEach((item) => {
            item.dispatchEvent(new Event('become-deselected'))
        })

    }
})


mainAreaFileDrop.addEventListener('dragover', (event: Event) => {
    event.preventDefault()

    mainAreaFileDrop.classList.add('drag-over')
})

mainAreaFileDrop.addEventListener('dragleave', () => {
    mainAreaFileDrop.classList.remove('drag-over')
})

mainAreaFileDrop.addEventListener('drop', (event: DragEvent) => {
    event.preventDefault();

    mainAreaFileDrop.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    
    if (!files) return;

    for (const file of files) {
        const mediaType = mediaTypeOfFile(file.type.slice(file.type.indexOf('/') + 1))
        if (mediaType === 'unknown') continue;

        const path = window.electronAPI.getFilePath(file);
        let uploadElement: HTMLElement;

        switch(mediaType) {
            case 'image':
                uploadElement = createImageUploadItem(path, file.name, file.type, file.size)
                break;
            case 'video':
                uploadElement = createVideoUploadItem(path, file.name, file.type, file.size)
                break;
        }
        
        uploadGrid.insertAdjacentElement('beforeend', uploadElement)
    }

    updateSelectionQuantityLabel();
})


const mediaTypeOfFile = (extName: string): 'image'|'video'|'unknown' => {
    const IMAGE_FORMATS: string[] = ['png', 'apng', 'pjp', 'jfif', 'jpe', 'pjpeg', 'jpeg', 'jpg', 'webp'];
    const VIDEO_FORMATS: string[] = ['webm', 'gif', 'm4v', 'mp4', 'webp', 'matroska'];

    if (IMAGE_FORMATS.includes(extName)) return 'image';
    if (VIDEO_FORMATS.includes(extName)) return 'video';

    return 'unknown';
}


document.querySelectorAll<HTMLElement>('.open-file-select').forEach(fileSelect => {
    fileSelect.addEventListener('click', async () => {
        const files: FileInfo[] = await window.electronAPI.fileSelectDialog();

        for (let i = 0; i < files.length; i++) {
            const mediaType = mediaTypeOfFile(files[i].type.substring(files[i].type.indexOf('.') + 1))
            if (mediaType === "unknown") continue;

            let uploadElement: HTMLElement;

            switch (mediaType) {
                case 'image':
                    uploadElement = createImageUploadItem(files[i].path, files[i].name, files[i].type, files[i].size);
                    break;
                case 'video':
                    uploadElement = createVideoUploadItem(files[i].path, files[i].name, files[i].type, files[i].size)
                    break;
            }

            uploadGrid.insertAdjacentElement('beforeend', uploadElement)
        }

        updateSelectionQuantityLabel()
    })
})

/**
 * Formats a number of bytes to be more human readable. Results has at most
 * one decimal point as is appended with B, KB, MB, or GB depending on the size.
 * 
 * @param bytes The number of bytes
 * @returns A human-readable version of the number of bytes
 */
export const getSizeString = (bytes: number): string => {

    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 ** 2) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 ** 3) {
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    } else {
        return `${(bytes / (1024 ** 3)).toFixed(1)} GB`
    }
}

/**
 * Creates an upload item for an image. The appropriate event listeners are added to
 * the element before it is returned.
 * 
 * @param path The path to the image file, used for the preview
 * @param name The name of the file, used as a small title
 * @param type The filetype, used as supplemental information
 * @param size The size of the file in raw bytes that will be formatted, supplemental information
 * @returns The upload image item.
 */
const createImageUploadItem = (path: string, name: string, type: string, size: number): HTMLElement => {
    
    const item = document.createElement('image-item')
    item.setAttribute('path', path)
    item.setAttribute('name', name)
    item.setAttribute('type', type)
    item.setAttribute('size', size.toString())
    return item;

}


const createVideoUploadItem = (path: string, name: string, type: string, size: number): HTMLElement => {
    const item = document.createElement('video-item')
    item.setAttribute('path', path)
    item.setAttribute('name', name)
    item.setAttribute('type', type)
    item.setAttribute('size', size.toString())
    return item;
}

// uploadGrid.insertAdjacentElement('beforeend', createVideoUploadItem(
//     "C:\\Users\\Mater\\OneDrive\\Desktop\\Call me Avatar 😏 [CYJTeUQVXAY].webm",
//     "Call me Avatar",
//     "video/webm",
//     5103616
// ))

// In case there are pre-generated upload items, the bulk action bar
// will automatically have the correct label.
updateSelectionQuantityLabel()