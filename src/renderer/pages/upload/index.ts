
let selectedItems: HTMLElement[] = [];

const selectedLabel = document.getElementById('bulkaction-total');
const bulkactionCheckbox = document.getElementById('bulkaction-checkbox') as HTMLInputElement;
const mainAreaFileDrop = document.getElementById('upload-main-area-file') as HTMLElement;

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

document.querySelectorAll<HTMLElement>('.upload-item').forEach((item) => {
    
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

        console.log({
            name: file.name,
            path,
            type: file.type,
            size: file.size
        })
    }
})

updateSelectionQuantityLabel()