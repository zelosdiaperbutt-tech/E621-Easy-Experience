const selectedLabel = document.getElementById('bulkaction-total');
const bulkactionCheckbox = document.getElementById('bulkaction-checkbox') as HTMLInputElement;
const bulkactionDeleteButton = document.getElementById('bulkaction-delete') as HTMLButtonElement
const mainAreaFileDrop = document.getElementById('upload-main-area-file') as HTMLElement;
const uploadGrid = document.getElementById('upload-main-area-grid') as HTMLElement;

import { itemManager } from './itemManager.js'

import { ImageUploadItem } from '../../components/imageUploadItem.js';
import { VideoUploadItem } from '../../components/videoUplaodItem.js';

bulkactionDeleteButton.addEventListener('click', () => {
    itemManager.deleteAllSelected(updateSelectionQuantityLabel)
})

/**
 * Changes the text of the selection label on the bulk action bar to reflect
 * the total number of items and the amount of items that are currently selected.
 * @returns 
 */
export const updateSelectionQuantityLabel = (): void => {
    const totalItems: number = document.querySelectorAll('.upload-item').length;
    const numberSelected: number = itemManager.selectedItems.length;

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

mainAreaFileDrop.addEventListener('drop', async (event: DragEvent) => {
    event.preventDefault();

    mainAreaFileDrop.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    
    if (!files) return;

    for (const file of files) {
        await itemManager.createFromFile(uploadGrid, file);
    }

    updateSelectionQuantityLabel();
})

document.querySelectorAll<HTMLElement>('.open-file-select').forEach(fileSelect => {
    fileSelect.addEventListener('click', async () => {
        const files: FileInfo[] = await window.electronAPI.fileSelectDialog();

        for (let i = 0; i < files.length; i++) {
            await itemManager.createFromFileInfo(uploadGrid, files[i])
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

const checkIfItemIsValidForUpload = (item: UploadItem) => {
    return item.rating !== 'u' && item.path !== "" && item.sources !== null
}

const moveSelectedItemToUploadQueue = async (asPending: boolean = true) => {
    const acceptableItems = itemManager.selectedItems.filter(i => checkIfItemIsValidForUpload(i))
    itemManager.selectedItems.filter(i => !checkIfItemIsValidForUpload(i)).forEach(i => {
        console.log("Not acceptable:", i)
        if (i instanceof ImageUploadItem) {i.dispatchEvent(new Event('become-deselected'))}
        else if (i instanceof VideoUploadItem) {i.dispatchEvent(new Event('become-deselected'))}
    })
    
    acceptableItems.forEach(async (item) => {
        
        item.parent = "";   // workaround for now, since the code for parent resolution is going to be complicated
        
        await window.queue.addUploadItem(item.toData(), [], asPending)

        console.log(item)

    })

    itemManager.deleteAllSelected(updateSelectionQuantityLabel);
}

document.getElementById('upload-action')?.addEventListener('click', () => {
    moveSelectedItemToUploadQueue(false)
})

// In case there are pre-generated upload items, the bulk action bar
// will automatically have the correct label.
updateSelectionQuantityLabel()