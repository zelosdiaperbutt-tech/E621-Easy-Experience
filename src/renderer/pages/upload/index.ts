const selectedLabel = document.getElementById('bulkaction-total');
const bulkactionCheckbox = document.getElementById('bulkaction-checkbox') as HTMLInputElement;
const bulkactionDeleteButton = document.getElementById('bulkaction-delete') as HTMLButtonElement
const mainAreaFileDrop = document.getElementById('upload-main-area-file') as HTMLElement;
const uploadGrid = document.getElementById('upload-main-area-grid') as HTMLElement;
const bulkOptions = document.getElementById('bulkaction-options') as HTMLElement;


import { SelectableButton } from '../../components/selectableButton.js'
import { ExclusiveButton } from '../../components/exclusiveButton.js';
import { ConditionButton } from '../../components/conditionButton.js';
import { ConditionalButton } from '../../components/conditionalButton.js';

import { itemManager } from './itemManager.js'


// Selected upload elements
let selectedItems: HTMLElement[] = [];


bulkactionDeleteButton.addEventListener('click', () => {
    // deleteSelectedItems()
    itemManager.deleteAllSelected()
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

function commonElements<T>(arrays: T[][]): T[] {
    if (arrays.length === 0) return [];
    
    return arrays.reduce((accumulator, currentArray) => {
        return accumulator.filter(element => currentArray.includes(element))
    })
}

function commonElement<T>(values: T[]): T | null {
    if (values.length === 0) return null;
    if (values.length === 1) return structuredClone(values[0]);
    
    for (let i = 0; i < values.length - 1; i++) {
        if (values[i] !== values[i + 1]) return null;
    }
    
    return structuredClone(values[0])
}

const findCommonalitiesInSelectedElements = (items: UploadItem[]): CommonTagInformation => {
    const commonRating = commonElement(items.map(i => i.rating))
    const commonParent = commonElement(items.map(i => i.parent))
    const commonDescription = commonElement(items.map(i => i.description))
    const commonNumberOfCharacters = commonElement(items.map(i => i.numberOfCharacters))
    
    const commonCreators = commonElements(items.map(i => i.creators));
    const commonCharacters = commonElements(items.map(i => i.characters));
    const commonGenders = commonElements(items.map(i => i.genders));
    const commonSpecies = commonElements(items.map(i => i.species))
    const commonGeneral = commonElements(items.map(i => i.general))
    const commonRelations = commonElements(items.map(i => i.relations))
    const commonSpeciesTypes = commonElements(items.map(i => i.speciesTypes))

    return {
        rating: commonRating,
        parent: commonParent,
        description: commonDescription,
        numberOfCharacters: commonNumberOfCharacters,
        creators: commonCreators,
        characters: commonCharacters,
        genders: commonGenders,
        species: commonSpecies,
        general: commonGeneral,
        relations: commonRelations,
        speciesTypes: commonSpeciesTypes
    }
}

const commonTagsArea = document.getElementById('bulkaction-bar-common') as HTMLElement;

type CommonTagInformation = {
    rating: 'e'|'q'|'s'|'u'|null,
    parent: string|null,
    description: string|null,
    numberOfCharacters: NumberOfCharacters | null,
    creators: string[],
    characters: string[],
    genders: Gender[],
    species: string[],
    general: string[],
    relations: Relations[],
    speciesTypes: SpeciesType[]
}

let tagsInCommonAtStart: CommonTagInformation = {
    rating: null,
    parent: null,
    description: null,
    numberOfCharacters: null,
    creators: [],
    characters: [],
    genders: [],
    species: [],
    general: [],
    relations: [],
    speciesTypes: []
};
let tagsInCommonAtEnd: CommonTagInformation = {
    rating: null,
    parent: null,
    description: null,
    numberOfCharacters: null,
    creators: [],
    characters: [],
    genders: [],
    species: [],
    general: [],
    relations: [],
    speciesTypes: []
};

const startEnteringCommonTags = () => {
    const selectedUploadItems = selectedItems.map(item => item as unknown as UploadItem)
    tagsInCommonAtStart = findCommonalitiesInSelectedElements(selectedUploadItems)
    console.log(tagsInCommonAtStart)

    const ratingLetterCon = new Map<string, string>([
        ["e", "explicit"],
        ["q", "questionable"],
        ["s", "safe"],
        ["u", "unset"]
    ])

    if (tagsInCommonAtStart.rating && tagsInCommonAtStart.rating !== 'u') {
        let ratingButton: ExclusiveButton = commonTagsArea.querySelector<ExclusiveButton>(`exclusive-button[group-name="common-rating-button"][value="${ratingLetterCon.get(tagsInCommonAtStart.rating)}"]`) as ExclusiveButton
        ratingButton.dispatchEvent(new Event('select'))
    } else {
        commonTagsArea.querySelectorAll<ExclusiveButton>('exclusive-button[group-name="common-rating-button"]').forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
    }

    tagsInCommonAtStart.speciesTypes.forEach(type => {
        commonTagsArea.querySelector(`selectable-button[value="${type.toString()}"]`)?.dispatchEvent(new Event('select'))
    })

    tagsInCommonAtStart.genders.forEach(gender => {
        commonTagsArea.querySelector(`condition-button[group-name="common-relations"][value="${gender.toString()}"]`)?.dispatchEvent(new Event('select'))
    })

    tagsInCommonAtStart.relations.forEach(relation => {
        commonTagsArea.querySelector(`conditional-button[group-name="common-relations"][value="${relation.toString()}"]`)?.dispatchEvent(new Event('select'))
    })

    if (tagsInCommonAtStart.numberOfCharacters && tagsInCommonAtStart.numberOfCharacters !== ("unset" as NumberOfCharacters)) {
        let button: ExclusiveButton = commonTagsArea.querySelector<ExclusiveButton>(`exclusive-button[group-name="common-character-number"][value="${tagsInCommonAtStart.numberOfCharacters.toString()}"]`) as ExclusiveButton
        button.dispatchEvent(new Event('select'))
    } else {
        commonTagsArea.querySelectorAll('exclusive-button[group-name="common-character-number"]').forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
    }

    commonTagsArea.querySelector<HTMLTextAreaElement>('#common-characters textarea')!.value = tagsInCommonAtStart.characters.join(' ')
    commonTagsArea.querySelector<HTMLTextAreaElement>('#common-general textarea')!.value = tagsInCommonAtStart.general.join(' ')
    commonTagsArea.querySelector<HTMLTextAreaElement>('#common-species textarea')!.value = tagsInCommonAtStart.species.join(' ');
    commonTagsArea.querySelector<HTMLTextAreaElement>('#common-characters textarea')!.value = tagsInCommonAtStart.characters.join(' ')
    commonTagsArea.querySelector<HTMLTextAreaElement>('#common-creators textarea')!.value = tagsInCommonAtStart.creators.join(' ');
    commonTagsArea.querySelector<HTMLTextAreaElement>('#common-description textarea')!.value = tagsInCommonAtStart.description ?? "";
    commonTagsArea.querySelector<HTMLInputElement>('#common-parent input[type="text"]')!.value = tagsInCommonAtStart.parent ?? "";
}

const endEnteringCommonTags = () => {
    tagsInCommonAtEnd.characters = commonTagsArea.querySelector<HTMLTextAreaElement>('#common-characters textarea')!.value.split(' ').filter(i => i.length > 0)
    tagsInCommonAtEnd.general = commonTagsArea.querySelector<HTMLTextAreaElement>('#common-general textarea')!.value.split(' ').filter(i => i.length > 0)
    tagsInCommonAtEnd.species = commonTagsArea.querySelector<HTMLTextAreaElement>('#common-species textarea')!.value.split(' ').filter(i => i.length > 0)
    tagsInCommonAtEnd.characters = commonTagsArea.querySelector<HTMLTextAreaElement>('#common-characters textarea')!.value.split(' ').filter(i => i.length > 0)
    tagsInCommonAtEnd.creators = commonTagsArea.querySelector<HTMLTextAreaElement>('#common-creators textarea')!.value.split(' ').filter(i => i.length > 0)
    tagsInCommonAtEnd.description = commonTagsArea.querySelector<HTMLTextAreaElement>('#common-description textarea')!.value;

    let parent = commonTagsArea.querySelector<HTMLInputElement>('#common-parent input[type="text"]')!.value
    if (parent.length === 0) {
        tagsInCommonAtEnd.parent = null
    } else {
        tagsInCommonAtEnd.parent = parent;
    }

    let ratingCon = new Map<string, string>([
        ["safe", "s"],
        ["questionable", "q"],
        ["explicit", "e"],
        ["unset", "u"]
    ])
    const selectedRating = commonTagsArea.querySelector<ExclusiveButton>('exclusive-button[group-name="common-rating-button"][selected="true"]')
    if (selectedRating) {
        tagsInCommonAtEnd.rating = (ratingCon.get(selectedRating.value) as 's'|'q'|'e'|'u')
    } else {
        tagsInCommonAtEnd.rating = 'u'
    }

    let speciesTypes: SpeciesType[] = []
    commonTagsArea.querySelectorAll<SelectableButton>('#common-species-types selectable-button[selected="true"]').forEach(button => {
        speciesTypes.push(button.value as SpeciesType)
    })
    tagsInCommonAtEnd.speciesTypes = speciesTypes.length > 0 ? speciesTypes : []; 

    let genders: Gender[] = [];
    commonTagsArea.querySelectorAll<ConditionButton>('#common-genders condition-button[selected="true"]').forEach(button => {
        genders.push(button.value as Gender)
    })
    tagsInCommonAtEnd.genders = genders;

    let relations: Relations[] = [];
    commonTagsArea.querySelectorAll<ConditionalButton>('#common-relations conditional-button[active="true"][selected="true"]').forEach(button => {
        if (button.value === "") return;
        relations.push(button.value as Relations)
    })
    tagsInCommonAtEnd.relations = relations;

    const selectedNumberOfCharacters = commonTagsArea.querySelector<ExclusiveButton>('#common-characters exclusive-button[group-name="common-character-number"][selected="true"]')
    if (selectedNumberOfCharacters) {
        tagsInCommonAtEnd.numberOfCharacters = (selectedNumberOfCharacters.value as NumberOfCharacters)
    } else {
        tagsInCommonAtEnd.numberOfCharacters = ("unset" as NumberOfCharacters)
    }

    console.log(tagsInCommonAtEnd);
}

const updateCommonTags = (item: UploadItem) => {

    if (tagsInCommonAtEnd.general.length > 0) {
        item.general = reflectChanges(item.general, tagsInCommonAtStart.general, tagsInCommonAtEnd.general)
    }

    if (tagsInCommonAtEnd.creators.length > 0) {
        item.creators = reflectChanges(item.creators, tagsInCommonAtStart.creators, tagsInCommonAtEnd.creators)
    }

    if (tagsInCommonAtEnd.characters.length > 0) {
        item.characters = reflectChanges(item.characters, tagsInCommonAtStart.characters, tagsInCommonAtEnd.characters)
    }

    if (tagsInCommonAtEnd.species.length > 0) {
        item.species = reflectChanges(item.species, tagsInCommonAtStart.species, tagsInCommonAtEnd.species)
    }

    if (tagsInCommonAtEnd.genders.length > 0) {
        item.genders = reflectChanges(item.genders, tagsInCommonAtStart.genders, tagsInCommonAtEnd.genders).map(g => g as Gender)
    }

    if (tagsInCommonAtEnd.relations.length > 0) {
        item.relations = reflectChanges(item.relations, tagsInCommonAtStart.relations, tagsInCommonAtEnd.relations).map(r => r as Relations)
    }

    if (tagsInCommonAtEnd.speciesTypes.length > 0) {
        item.speciesTypes = reflectChanges(item.speciesTypes, tagsInCommonAtStart.speciesTypes, tagsInCommonAtEnd.speciesTypes).map(st => st as SpeciesType)
    }

    if (tagsInCommonAtEnd.rating) {
        item.rating = tagsInCommonAtEnd.rating
    }

    if (tagsInCommonAtEnd.description) {
        item.description = tagsInCommonAtEnd.description
    }

    if (tagsInCommonAtEnd.parent) {
        item.parent = tagsInCommonAtEnd.parent
    }
}

const reflectChanges = (toChange: string[], initial: string[], final: string[]): string[] => {
    const initialSet = new Set(initial)
    const finalSet = new Set(final)

    return [
        ...toChange.filter(item => !initialSet.has(item) || finalSet.has(item)),
        ...final.filter(item => !initialSet.has(item))
    ]
}

const commonCancel = document.getElementById('common-cancel')
const commonConfirm = document.getElementById('common-confirm')

bulkOptions.addEventListener('click', () => {
    const active = commonTagsArea.getAttribute('active') === "true"
    
    if (!active) {
        if (selectedItems.length === 0) return;
        commonTagsArea.setAttribute('active', 'true')
        startEnteringCommonTags()
    }
})

commonConfirm?.addEventListener('click', () => {
    if (commonTagsArea.getAttribute('active') === "true") {
        endEnteringCommonTags();
        selectedItems.map(i => i as unknown as UploadItem).forEach(item => {
            updateCommonTags(item)
        })
        commonTagsArea.setAttribute('active', "false")
    }
})

commonCancel?.addEventListener('click', () => {
    if (commonTagsArea.getAttribute('active') === "true") {
        commonTagsArea.setAttribute('active', 'false')
    }
})

async function start() {
    // const item1: ImageUploadItem = await createImageUploadItem("C:\\Users\\Mater\\Downloads\\HRyyxL5aIAAkZ-L.jpg", "fox diaper gaming.jpg", '.jpg', 1) as ImageUploadItem
    // item1.rating = "e";
    // item1.genders = ["male" as Gender]
    // item1.general = ["diaper"]
    // item1.creators = ['syeenyeen']
    // item1.species = ['fox']
    // item1.numberOfCharacters = "solo" as NumberOfCharacters
    // item1.speciesTypes = ['anthro' as SpeciesType]
    // item1.relations = ['m/m' as Relations]

    // const item2: ImageUploadItem = await createImageUploadItem("C:\\Users\\Mater\\Downloads\\HRzqhvoa4AAr4ET.jpg", "rocky handsfree blorts.jpg", ".jpg", 2) as ImageUploadItem;
    // item2.rating = "e";
    // item2.genders = ["male" as Gender]
    // item2.general = ["diaper"]
    // item2.creators = ['poofbuttrocky']
    // item2.species = ['wolf']
    // item2.numberOfCharacters = "solo" as NumberOfCharacters
    // item2.speciesTypes = ['anthro' as SpeciesType]
    // item2.relations = ['m/m' as Relations]


    // uploadGrid.insertAdjacentElement('beforeend', item1)
    // uploadGrid.insertAdjacentElement('beforeend', item2)

    // findCommonalitiesInSelectedElements([item1, item2])
}

start()

// In case there are pre-generated upload items, the bulk action bar
// will automatically have the correct label.
updateSelectionQuantityLabel()