
let selectedItems: HTMLElement[] = [];

const selectedLabel = document.getElementById('bulkaction-total');
const bulkactionCheckbox = document.getElementById('bulkaction-checkbox') as HTMLInputElement;
const mainAreaFileDrop = document.getElementById('upload-main-area-file') as HTMLElement;
const uploadGrid = document.getElementById('upload-main-area-grid') as HTMLElement;

const addToSelected = (element: HTMLElement) => {
    if (!selectedItems.includes(element)) {
        selectedItems.push(element)
        updateSelectionQuantityLabel()
    }
}

const removeFromSelected = (element: HTMLElement) => {
    const index = selectedItems.indexOf(element)
    if (index !== -1) {
        selectedItems.splice(index, 1);
        updateSelectionQuantityLabel()
    }
}

const updateSelectionQuantityLabel = () => {
    const totalItems: number = document.querySelectorAll('.upload-item').length;
    const numberSelected: number = selectedItems.length;

    if (!selectedLabel) return;
    selectedLabel.innerText = `${numberSelected} of ${totalItems}`;
}

const addEventListenersToUploadItem = (item: HTMLElement): void => {
    item.addEventListener('become-selected', () => {
        item.dataset.selected = "true"

        const checkBox = item.querySelector<HTMLElement>('.upload-item-select-checkbox') as HTMLInputElement;
        if (checkBox) checkBox.checked = true;

        addToSelected(item);
    })

    item.addEventListener('become-deselected', () => {
        item.dataset.selected = "false"

        const checkBox = item.querySelector<HTMLElement>('.upload-item-select-checkbox') as HTMLInputElement;
        if (checkBox) checkBox.checked = false;

        removeFromSelected(item);
    })
    
    item.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        if (target.closest('img')) return;

        const selected = item.dataset.selected === "true"

        if (!selected) { // the item is going to be selected
            item.dispatchEvent(new Event('become-selected'))
        } else if (selected) {  // the item is going to be deselected
            item.dispatchEvent(new Event('become-deselected'))
        }
    })   
}

document.querySelectorAll<HTMLElement>('.upload-item').forEach((item) => {
    addEventListenersToUploadItem(item);
})

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

        const path = window.electronAPI.getFilePath(file);

        const uploadElement = createImageUploadItem(path, file.name, file.type, file.size)
        uploadGrid.insertAdjacentElement('beforeend', uploadElement)
    }

    updateSelectionQuantityLabel();
})


const getSizeString = (bytes: number): string => {

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

const createImageUploadItem = (path: string, name: string, type: string, size: number): HTMLElement => {
    
    const newItem = document.createElement('section');
    newItem.className = 'upload-item'
    newItem.setAttribute('data-selected', 'false')
    newItem.innerHTML = `
        <div class="upload-item-content">
            <div class="upload-item-content-header">
                <input type="checkbox" class="upload-item-select-checkbox">
            </div>
            <img src="${path}">
        </div>
        <div class="upload-item-footer">
            <p class="upload-item-name">${name}</p>
            <div class="upload-item-footer-info">
                <p class="upload-item-format">${type}</p>
                <p class="upload-item-size">${getSizeString(size)}</p>
            </div>
        </div>
    `

    addEventListenersToUploadItem(newItem)

    return newItem;
}



updateSelectionQuantityLabel()