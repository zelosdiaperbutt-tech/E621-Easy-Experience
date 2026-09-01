const selectedLabel = document.getElementById('bulkaction-total');
const bulkactionCheckbox = document.getElementById('bulkaction-checkbox') as HTMLInputElement;
const bulkactionDeleteButton = document.getElementById('bulkaction-delete') as HTMLButtonElement
const mainAreaFileDrop = document.getElementById('upload-main-area-file') as HTMLElement;
const uploadGrid = document.getElementById('upload-main-area-grid') as HTMLElement;
const sidebar = document.getElementById('upload-right-sidebar') as HTMLElement;
const bulkOptions = document.getElementById('bulkaction-options') as HTMLElement;


import {setCurrentUploadItem, updateModalInfo, activateModal} from './modal.js'
import {ItemUpload} from '../../components/itemUpload.js'

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
        const path = window.electronAPI.getFilePath(file);

        const uploadElement = createImageUploadItem(path, file.name, file.type, file.size)
        uploadGrid.insertAdjacentElement('beforeend', uploadElement)
    }

    updateSelectionQuantityLabel();
})

document.querySelectorAll<HTMLElement>('.open-file-select').forEach(fileSelect => {
    fileSelect.addEventListener('click', async () => {
        const files: FileInfo[] = await window.electronAPI.fileSelectDialog();

        for (let i = 0; i < files.length; i++) {
            const uploadElement = createImageUploadItem(files[i].path, files[i].name, files[i].type, files[i].size);
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
    
    const item = document.createElement('item-upload')
    item.setAttribute('path', path)
    item.setAttribute('name', name)
    item.setAttribute('type', type)
    item.setAttribute('size', size.toString())
    return item;

}

let selectedGenders: Set<Gender> = new Set<Gender>();

document.querySelectorAll<HTMLElement>('.selectable-button').forEach(button => {
    button.addEventListener('select', () => {
        button.dataset.selected = "true"
    })

    button.addEventListener('deselect', () => {
        button.dataset.selected = "false"
    })

    button.addEventListener('click', () => {
        const currentlySelected = button.dataset.selected === "true";

        if (currentlySelected) {
            button.dispatchEvent(new Event('deselect'))
        } else {
            button.dispatchEvent(new Event('select'))
        }
    })
})

document.querySelectorAll<HTMLElement>('.exclusive-selectable-button').forEach(exclusive => {
    exclusive.addEventListener('exclusive', () => {
        const groupName = exclusive.dataset.groupname;
        document.querySelectorAll<HTMLElement>(`.exclusive-selectable-button[data-groupname="${groupName}"]`).forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
    })

    exclusive.addEventListener('click', () => {
        const currentlySelected = exclusive.dataset.selected === "true";

        if (!currentlySelected) return;

        exclusive.dispatchEvent(new Event('exclusive'))

        exclusive.dispatchEvent(new Event('select'))
    })
})

document.querySelectorAll<HTMLElement>('.gender-button').forEach(button => {
    button.addEventListener('select', () => {
        if (button.dataset.value === "male") selectedGenders.add(Gender.Male)
        if (button.dataset.value === "female") selectedGenders.add(Gender.Female)
        if (button.dataset.value === "gynomorph") selectedGenders.add(Gender.Gynomorph)
        if (button.dataset.value === "andromorph") selectedGenders.add(Gender.Andromorph)
        if (button.dataset.value === "hermaphrodite") selectedGenders.add(Gender.Hermaphrodite)
        if (button.dataset.value === "male-herm") selectedGenders.add(Gender.MaleHerm)
        if (button.dataset.value === "ambiguous") selectedGenders.add(Gender.Ambiguous)

        genderButtonsChanged()
    })

    button.addEventListener('deselect', () => {
        if (button.dataset.value === "male") selectedGenders.delete(Gender.Male)
        if (button.dataset.value === "female") selectedGenders.delete(Gender.Female)
        if (button.dataset.value === "gynomorph") selectedGenders.delete(Gender.Gynomorph)
        if (button.dataset.value === "andromorph") selectedGenders.delete(Gender.Andromorph)
        if (button.dataset.value === "hermaphrodite") selectedGenders.delete(Gender.Hermaphrodite)
        if (button.dataset.value === "male-herm") selectedGenders.delete(Gender.MaleHerm)
        if (button.dataset.value === "ambiguous") selectedGenders.delete(Gender.Ambiguous)

        genderButtonsChanged()
    })
})

const genderButtonsChanged = () => {
    document.querySelectorAll<HTMLElement>('#upload-right-sidebar .conditional-button').forEach(button => {
        const active = shouldConditionalButtonActivate(button, selectedGenders)
        button.dataset.visible = (active ? "true" : "false");
        if (!active) button.dataset.selected = "false"
    })
}

const shouldConditionalButtonActivate = (button: HTMLElement, genders: Set<Gender>): boolean => {
    let gendersRequired: Gender[] = [];
    if (button.classList.contains('condition-male')) gendersRequired.push(Gender.Male)
    if (button.classList.contains('condition-female')) gendersRequired.push(Gender.Female)
    if (button.classList.contains('condition-andromorph')) gendersRequired.push(Gender.Andromorph)
    if (button.classList.contains('condition-gynomorph')) gendersRequired.push(Gender.Gynomorph)
    if (button.classList.contains('condition-hermaphrodite')) gendersRequired.push(Gender.Hermaphrodite)
    if (button.classList.contains('condition-male-herm')) gendersRequired.push(Gender.MaleHerm)
    if (button.classList.contains('condition-ambiguous')) gendersRequired.push(Gender.Ambiguous)

    for (let i = 0; i < gendersRequired.length; i++) {
        if (!genders.has(gendersRequired[i])) return false;
    }

    return true;
}


const setIntersection = <T>(stringSetList: Set<T>[]): Set<T> => {
    let common: Set<T> = stringSetList[0];
    let next: Set<T> = new Set<T>();
    for (let i = 1; i < stringSetList.length; i++) {
        stringSetList[i].forEach(t => {
            if (common.has(t)) next.add(t);
        })
        common = structuredClone(next);
        next.clear();
    }

    return common;
}

const setupSidebar = (info: {
    creators: string[], 
    characters: string[], 
    genders: string[], 
    relations: string[],
    species: string[],
    rating: Rating,
    general: string[],
    parent: string,
    description: string}) => {

    document.getElementById('creator-tags-in-common')!.innerText = info.creators.join(' ')
    document.getElementById('character-tags-in-common')!.innerText = info.characters.join(' ')
    document.getElementById('species-tags-in-common')!.innerText = info.species.join(' ')
    document.getElementById('general-tags-in-common')!.innerText = info.general.join(' ');
    (document.getElementById('parent-post-input')! as HTMLInputElement).value = info.parent
    document.getElementById('description-in-common')!.innerText = info.description

    // need to do some specific logic for the selectable buttons 'n shit
    console.log("Rating:", info.rating)
    switch(info.rating) {
        case "s":
            document.querySelector('.exclusive-selectable-button[data-groupname="rating-button"][data-value="safe"]')!.dispatchEvent(new Event('click'))
            break;
        case "q":
            document.querySelector('.exclusive-selectable-button[data-groupname="rating-button"][data-value="questionable"]')!.dispatchEvent(new Event('click'))
            break;
        case "e":
            document.querySelector('.exclusive-selectable-button[data-groupname="rating-button"][data-value="explicit"]')!.dispatchEvent(new Event('click'))
            break;
        case 'u':
            document.querySelectorAll<HTMLElement>('.exclusive-selectable-button[data-groupname="rating-button"]').forEach(button => button.dispatchEvent(new Event('deselect')))
            break;
        default:
            throw new Error('Improper rating');
    }
}


bulkOptions.addEventListener('click', () => {
    const sidebarEnabled = sidebar.dataset.active === "true"

    if (sidebarEnabled) {
        sidebar.dataset.active = "false"
        return;
    }

    if (selectedItems.length === 0) return;

    if (selectedItems.length === 1) {

        const selectedItem = selectedItems[0];
        const tagSection = (selectedItem.querySelector('.tag-section') as HTMLElement)
        const creators = (selectedItem.querySelector('.creator-tags') as HTMLElement).innerText.split(' ')
        const characters = (selectedItem.querySelector('.character-tags') as HTMLElement).innerText.split(' ')
        const genders = (selectedItem.querySelector('.gender-tags') as HTMLElement).innerText.split(' ')
        const species = (selectedItem.querySelector('.species-tags') as HTMLElement).innerText.split(' ')
        const general = (selectedItem.querySelector('.general-tags') as HTMLElement).innerText.split(' ')
        const parent = (selectedItem.querySelector('.parent-post') as HTMLElement).innerText
        const description = (selectedItem.querySelector('.description') as HTMLElement).innerText


        let ratingT = ( tagSection.dataset.rating ?? 'u')
        if (ratingT !== 's' && ratingT !== 'q' && ratingT !=='e') {
            tagSection.dataset.rating = 'u'
            ratingT = 'u'
        }

        setupSidebar({
            creators,
            characters,
            genders,
            relations: [],
            species,
            rating: (ratingT as Rating),
            general,
            parent,
            description
        })

        sidebar.dataset.active = "true";
        
        return;
    }

    let itemTags: Set<String>[] = [];

    selectedItems.forEach(item => {
        const creatorTags = item.querySelector<HTMLElement>('.creator-tags')
        if (creatorTags) {
            itemTags.push( new Set<String>(creatorTags.innerText.split(' ')) );
        }
    })

    // find all of the creator tags that are common to the selected items
    let commonCreators: Set<String> = setIntersection<String>(itemTags);

    console.log(commonCreators);

})




const addTagsToAllSelectedItems = (tags: string[], type: TagType) => {
    let queryDestination: string = "";
    switch (type) {
        case TagType.Creator:
            queryDestination = '.creator-tags'
            break;
        case TagType.Character:
            queryDestination = '.character-tags'
            break;
        case TagType.Gender:
            queryDestination = '.gender-tags'
            break;
        case TagType.Species:
            queryDestination = '.species-tags'
            break;
        case TagType.General:
            queryDestination = '.general-tags'
            break;
    }

    selectedItems.forEach(item => {
        const select = item.querySelector(queryDestination) as HTMLElement;
        if (!select) return;

        let tagsPresent: Set<string> = new Set<string>(select.innerText.split(' '))
        tags.forEach(tag => tagsPresent.add(tag))
        let newList: string[] = [];
        tagsPresent.forEach(t => newList.push(t))

        select.innerText = newList.join(' ').trim()
    })
}


// In case there are pre-generated upload items, the bulk action bar
// will automatically have the correct label.
updateSelectionQuantityLabel()