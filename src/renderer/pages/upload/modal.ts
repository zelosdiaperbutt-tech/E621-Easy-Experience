const modalBackground = document.getElementById('modal-background') as HTMLElement;
const modalSourceInputs = document.getElementById('modal-sources-inputs') as HTMLElement;
const modalAddSourceButton = document.getElementById('modal-add-source') as HTMLButtonElement;
const modalContentContainer = document.getElementById('content-container') as HTMLElement;

const modalNavigatePrevious = document.getElementById('modal-navigate-previous') as HTMLButtonElement;
const modalNavigateNext = document.getElementById('modal-navigate-next') as HTMLButtonElement;
const itemGrid = document.getElementById('upload-main-area-grid') as HTMLElement;

import { getSizeString } from './index.js'
import { itemManager } from './itemManager.js';

import { ImageUploadItem } from '../../components/imageUploadItem.js'
import { VideoUploadItem } from '../../components/videoUploadItem.js';
import { SelectableButton } from '../../components/selectableButton.js'
import { ExclusiveButton } from '../../components/exclusiveButton.js';
import { ConditionButton } from '../../components/conditionButton.js';
import { ConditionalButton } from '../../components/conditionalButton.js';

import { debouncedTagPreview, tagTypeNumberToClassName } from './autocomplete.js';

modalBackground.addEventListener('show', () => {
    modalBackground.classList.remove('modal-hidden')
})

modalBackground.addEventListener('hide', () => {
    modalBackground.classList.add('modal-hidden')
    currentUploadItem = null
    closeModal()
})

modalBackground.addEventListener('click', (event) => {
    if (event.target === modalBackground) {
        modalBackground.dispatchEvent(new Event('hide'))
    }
})

let currentUploadItem: UploadItem | null;

export const setCurrentUploadItem = (item: UploadItem): void => {
    currentUploadItem = item;
}

/**
 * Updates the various elements inside of the modal to reflect the information of the 
 * element that they selected.
 * 
 * @param uploadElement The item that whose information is being displayed in the modal
 * @param type Whether the media is an image or a video
 * @param info Meta information about the file for the user's benefit
 */
export const updateModalInfo = (
    uploadElement: UploadItem,
    type: 'image'|'video',
    info: FileInfo
) => {
    modalContentContainer.innerHTML = "";
    if (type === 'image') {
        // modalBackground.querySelector<HTMLImageElement>('#content-container img')!.src = info.path;
        const imageElement = document.createElement('img')
        imageElement.setAttribute('src', info.path)
        modalContentContainer.insertAdjacentElement('beforeend', imageElement)
    } else {
        // throw new Error('Video file types not implemented')
        const videoElement = document.createElement('video')
        videoElement.setAttribute('src', info.path)
        videoElement.controls = true
        modalContentContainer.insertAdjacentElement('beforeend', videoElement)
    }

    modalBackground.querySelector<HTMLElement>('#left-modal .content-name')!.innerText = info.name;
    modalBackground.querySelector<HTMLElement>('#left-modal .format')!.innerText = info.type;
    modalBackground.querySelector<HTMLElement>('#left-modal .file-size')!.innerText = getSizeString(info.size);

    const ratingShorthandConvertion: Map<string, string> = new Map<string, string>();
    ratingShorthandConvertion.set("e", "explicit");
    ratingShorthandConvertion.set("q", "questionable");
    ratingShorthandConvertion.set("s", "safe");
    ratingShorthandConvertion.set("u", "unset");
    
    if (uploadElement.rating !== 'u') {
        let ratingButton: ExclusiveButton = modalBackground.querySelector<ExclusiveButton>(`exclusive-button[group-name="modal-rating-button"][value="${ratingShorthandConvertion.get(uploadElement.rating)}"]`)!;
        ratingButton.dispatchEvent(new Event('select'))
    } else {
        modalBackground.querySelectorAll<ExclusiveButton>('exclusive-button[group-name="modal-rating-button"]').forEach(button => {
            button.dispatchEvent(new Event('deselect'));
        })       
    }

    uploadElement.speciesTypes.forEach(species => {
        modalBackground.querySelector<SelectableButton>(`selectable-button[value="${species.toString()}"`)?.dispatchEvent(new Event('select'))
    })
    
    uploadElement.genders.forEach(gender => {
        modalBackground.querySelector(`condition-button[group-name="modal-relations"][value="${gender.toString()}"]`)?.dispatchEvent(new Event('select'));
    })

    uploadElement.relations.forEach(relation => {
        modalBackground.querySelector(`conditional-button[group-name="modal-relations"][value="${relation.toString()}"]`)?.dispatchEvent(new Event('select'));
    })

    if (uploadElement.numberOfCharacters !== ("unset" as NumberOfCharacters)) {
        let numberOfCharactersButton: ExclusiveButton = modalBackground.querySelector<ExclusiveButton>(`exclusive-button[group-name="modal-character-number"][value="${uploadElement.numberOfCharacters.toString()}"]`)!;
        numberOfCharactersButton.dispatchEvent(new Event('select'))
    } else {
        modalBackground.querySelectorAll<HTMLButtonElement>('exclusive-button[group-name="modal-character-number"]').forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
    }

    uploadElement.sources.forEach(source => {
        const sourceElement = createNewModalSource(source)
        modalSourceInputs.insertAdjacentElement('beforeend', sourceElement)
    })
    if (modalSourceInputs.innerHTML.trim() === "") {
        const sourceElement = createNewModalSource("")
        modalSourceInputs.insertAdjacentElement('beforeend', sourceElement)
    }

    modalBackground.querySelector<HTMLTextAreaElement>('#modal-characters textarea')!.value = uploadElement.characters.join(' ')
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-general textarea')!.value = uploadElement.general.join(' ')
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-species textarea')!.value = uploadElement.species.join(' ')
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-creators textarea')!.value = uploadElement.creators.join(' ')
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-description textarea')!.value = uploadElement.description
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-parent input[type="text"]')!.value = uploadElement.parent
}

/**
 * Updates the currently selected element's attributes and properties to affect the
 * selected buttons and typed text on the modal.
 */
export const writeModalChanges = (currentItem: UploadItem) => {

    const longRatingToLetter = new Map<string, string>();
    longRatingToLetter.set('safe', 's')
    longRatingToLetter.set('questionable', 'q')
    longRatingToLetter.set('explicit', 'e')

    const selectedRating = document.querySelector<ExclusiveButton>('exclusive-button[group-name="modal-rating-button"][selected="true"]')
    if (selectedRating) {
        currentItem.rating = (longRatingToLetter.get(selectedRating.value)) as 'e'|'q'|'s'|'u'
    } else {
        currentItem.rating = 'u'
    }

    let speciesTypes: SpeciesType[] = [];
    modalBackground.querySelectorAll<SelectableButton>('#modal-species-types selectable-button[selected="true"]').forEach(button => {
        speciesTypes.push(button.value as SpeciesType)
    })
    currentItem.speciesTypes = speciesTypes;

    let genders: Gender[] = [];
    modalBackground.querySelectorAll<ConditionButton>('#modal-genders condition-button[selected="true"]').forEach(button => {
        genders.push(button.value as Gender)
    })
    currentItem.genders = genders;

    let relations: Relations[] = [];
    modalBackground.querySelectorAll<ConditionalButton>('#modal-relations conditional-button[active="true"][selected="true"]').forEach(button => {
        if (button.value === "") return;
        relations.push(button.value as Relations)
    })
    currentItem.relations = relations;

    const selectedNumberOfCharacters = modalBackground.querySelector<ExclusiveButton>('#modal-characters exclusive-button[group-name="modal-character-number"][selected="true"]')
    if (selectedNumberOfCharacters) {
        currentItem.numberOfCharacters = (selectedNumberOfCharacters.value as NumberOfCharacters)
    } else {
        currentItem.numberOfCharacters = ('unset' as NumberOfCharacters)
    }

    let sources: string[] = [];
    modalSourceInputs.querySelectorAll<HTMLInputElement>('input[type="text"]').forEach(source => {
        if (source.value && source.value !== "") sources.push(source.value)
    })
    currentItem.sources = sources;

    currentItem.characters = modalBackground.querySelector<HTMLTextAreaElement>('#modal-characters textarea')!.value.split(' ')
    currentItem.general = modalBackground.querySelector<HTMLTextAreaElement>('#modal-general textarea')!.value.split(' ')
    currentItem.species = modalBackground.querySelector<HTMLTextAreaElement>('#modal-species textarea')!.value.split(' ')
    currentItem.creators = modalBackground.querySelector<HTMLTextAreaElement>('#modal-creators textarea')!.value.split(' ')
    currentItem.description = modalBackground.querySelector<HTMLTextAreaElement>('#modal-description textarea')!.value
    currentItem.parent = modalBackground.querySelector<HTMLTextAreaElement>('#modal-parent input[type="text"]')!.value

    itemManager.saveAllItems(itemGrid);
}

/**
 * When the modal is open, if there is a previous upload element,
 * changes to the current item are saved and then the modal's information
 * is changed to the previous item's info.
 * 
 * @returns 
 */
const navigatePrevious = () => {
    let index: number = -1;

    if (
        !(currentUploadItem instanceof ImageUploadItem) && 
        !(currentUploadItem instanceof VideoUploadItem) 
    ) return; 

    for (let i = 0; i < itemGrid.children.length; i++) {
        if (currentUploadItem === itemGrid.children[i]) {
            index = i;
            break;
        }
    }

    if (index === -1) return;
    if (index === 0) return;

    const previousElement = itemGrid.children.item(index - 1);
    if (!previousElement) return;

    let previousUploadItem: UploadItem;
    let mediaType: string;

    if (previousElement instanceof ImageUploadItem) {
        previousUploadItem = previousElement;
        mediaType = 'image'
    } else if (previousElement instanceof VideoUploadItem) {
        previousUploadItem = previousElement;
        mediaType = 'video'
    } else return;

    writeModalChanges(currentUploadItem);
    clearModal();
    setCurrentUploadItem(previousUploadItem);
    updateModalInfo(previousUploadItem, mediaType as 'image'|'video', {
        path: previousUploadItem.path,
        name: previousUploadItem.name,
        type: previousUploadItem.type,
        size: previousUploadItem.size
    })
}

modalNavigatePrevious.addEventListener('click', navigatePrevious);

/**
 * When the modal is open, if there is a next uplaod element,
 * changes to the current item are save and then the modal's information
 * is changed to the next item's info.
 * @returns 
 */
const navigateNext = () => {
    let index: number = -1;

    if (
        !(currentUploadItem instanceof ImageUploadItem) &&
        !(currentUploadItem instanceof VideoUploadItem)
    ) return;

    for (let i = 0; i < itemGrid.children.length; i++) {
        if (currentUploadItem === itemGrid.children[i]) {
            index = i;
            break;
        }
    }

    if (index === -1) return;
    if (index === itemGrid.children.length - 1) return;

    const nextElement = itemGrid.children.item(index + 1);
    if (!nextElement) return;

    let nextUploadItem: UploadItem;
    let mediaType: string;

    if (nextElement instanceof ImageUploadItem) {
        nextUploadItem = nextElement;
        mediaType = 'image'
    } else if (nextElement instanceof VideoUploadItem) {
        nextUploadItem = nextElement;
        mediaType = 'video'
    } else return;

    writeModalChanges(currentUploadItem);
    clearModal();
    setCurrentUploadItem(nextUploadItem);
    updateModalInfo(nextUploadItem, mediaType as 'image'|'video', {
        path: nextUploadItem.path,
        name: nextUploadItem.name,
        type: nextUploadItem.type,
        size: nextUploadItem.size
    })
}

modalNavigateNext.addEventListener('click', navigateNext)


/**
 * Displays the modal with the information it currenly has.
 * To update its information, call `updateModalInfo()` beforehand.
 * @see {@link updateModalInfo}
 */
export const activateModal = () => {
    modalBackground.dispatchEvent(new Event('show'))
}

/**
 * Resets everything inside of the modal so that no input from one item can bleed
 * over into another item.
 */
const clearModal = () => {
    modalBackground.querySelectorAll<HTMLElement>('.selectable-button').forEach(button => {
        button.dispatchEvent(new Event('deselect'))
    })
    modalBackground.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(textArea => {
        textArea.value = "";
    })
    modalBackground.querySelectorAll<HTMLInputElement>('input[type="text"]').forEach(input => {
        input.value = ""
    })
    modalBackground.querySelectorAll<SelectableButton>('selectable-button').forEach(button => {
        button.dispatchEvent(new Event('deselect'))
    })
    modalBackground.querySelectorAll<ExclusiveButton>('exclusive-button').forEach(button => {
        button.dispatchEvent(new Event('deselect'))
    })
    modalBackground.querySelectorAll<ConditionButton>('condition-button').forEach(button => {
        button.dispatchEvent(new Event('deselect'))
    })
    modalBackground.querySelectorAll<ConditionalButton>('conditional-button').forEach(button => {
        button.dispatchEvent(new Event('deselect'))
    })
    modalSourceInputs.innerHTML = "";
}

/**
 * Called when the modal needs to be closed, prevents changes to the previous element
 * from mistakenly being carried over to the next element.
 */
const closeModal = () => {
    clearModal()

    modalSourceInputs.innerHTML = "";

    modalContentContainer.querySelector('video')?.pause()
}

document.querySelector<HTMLButtonElement>('#modal-confirm-button')?.addEventListener('click', () => {
    if (currentUploadItem) {
        writeModalChanges(currentUploadItem)
    }

    modalBackground.dispatchEvent(new Event('hide'))
})

document.querySelector<HTMLButtonElement>('#modal-cancel-button')?.addEventListener('click', () => {
    modalBackground.dispatchEvent(new Event('hide'))
})


modalAddSourceButton.addEventListener('click', () => {
    const newSource = createNewModalSource()
    modalSourceInputs.insertAdjacentElement('beforeend', newSource)
})

const createNewModalSource = (value: string = "") => {
    const sourceInput = document.createElement('input')
    sourceInput.setAttribute('type', 'text')
    sourceInput.classList = "source-input"
    sourceInput.setAttribute('value', value)
    return sourceInput;
}

enum Gender {
    Male = "male",
    Female = "female",
    Andromorph = "andromorph",
    Gynomorph = "gynomorph",
    Hermaphrodite = "hermaphrodite",
    MaleHerm = "male-herm",
    Ambiguous = "ambiguous"
}

enum Relations {
    MM = "m/m",
    MF = "m/f",
    MAnd = "m/and",
    MGyn = "m/gyn",
    MHerm = "m/herm",
    MMherm = "m/mherm",
    MAmb = "m/amb",
    FF = "f/f",
    FAnd = "f/and",
    FGyn = "f/gyn",
    FHerm = "f/herm",
    FMherm = "f/mherm",
    FAmb = "f/amb",
    AndAnd = "and/and",
    AndGyn = "and/gyn",
    AndHerm = "and/herm",
    AndMherm = "and/mherm",
    AndAmb = "and/amb",
    GynGyn = "gyn/gyn",
    GynHerm = "gyn/herm",
    GynMherm = "gyn/mherm",
    GynAmb = "gyn/amb",
    HermHerm = "herm/herm",
    HermMherm = "herm/mherm",
    HermAmb = "herm/amb",
    MhermMherm = "mherm/mherm",
    MhermAmb = "mherm/amb",
    AmbAmb = "amb/amb"
}

enum SpeciesType {
    Anthro = "anthro",
    Feral = "feral",
    Humanoid = "humanoid",
    Human = "human",
    Taur = "taur"
}

enum NumberOfCharacters {
    Zero = "zero",
    Solo = "solo",
    Duo = "duo",
    Trio = "trio",
    Group = "group",
    Unset = "unset"
}

const genderToTag = (g: Gender): string => {
    if (g === Gender.Ambiguous) return "ambiguous_gender"
    if (g === Gender.MaleHerm) return "maleherm"

    return g.toString();
}

const relationsToTag = (r: Relations): string => {
    const map = new Map<Relations, string>([
        [Relations.MM, "male/male"],
        [Relations.MF, "male/female"],
        [Relations.MAnd, "andromorph/male"],
        [Relations.MGyn, "gynomorph/male"],
        [Relations.MHerm, "herm/male"],
        [Relations.MMherm, "maleherm/male"],
        [Relations.MAmb, "male/ambiguous"],
        [Relations.FF, "female/female"],
        [Relations.FAnd, "andromorph/female"],
        [Relations.FGyn, "gynomorph/female"],
        [Relations.FHerm, "herm/female"],
        [Relations.FMherm, "maleherm/female"],
        [Relations.FAmb, "female/ambiguous"],
        [Relations.AndAnd, "andromorph/andromorph"],
        [Relations.AndGyn, "andromorph/gynomorph"],
        [Relations.AndHerm, "andromorph/hermaphrodite"],
        [Relations.AndMherm, "maleherm/andromorph"],
        [Relations.AndAmb, "andromorph/ambiguous"],
        [Relations.GynGyn, "gynomorph/gynomorph"],
        [Relations.GynHerm, "gynomorph/hermaphrodite"],
        [Relations.GynMherm, "maleherm/gynomorph"],
        [Relations.GynAmb, "gynomorph/ambiguous"],
        [Relations.HermHerm, "herm/herm"],
        [Relations.HermMherm, "maleherm/herm"],
        [Relations.HermAmb, "herm/ambiguous"],
        [Relations.MhermMherm, "maleherm/maleherm"],
        [Relations.MhermAmb, "maleherm/ambiguous"],
        [Relations.AmbAmb, "ambiguous/ambiguous"]
    ]);

    return map.get(r) ?? "";
}

const speciesTypeToTag = (sT: SpeciesType): string => {
    return sT.toString()
}

const numberOfCharactersToTag = (n: NumberOfCharacters): string => {
    if (n === NumberOfCharacters.Unset) return ""
    if (n === NumberOfCharacters.Zero) return "zero_pictured"

    return n.toString()
}


const aggregateCurrentTags = (): string[] => {
    let tags: string[] = [];

    modalBackground.querySelectorAll<SelectableButton>('#modal-species-types selectable-button[selected="true"]').forEach(button => {
        tags.push(speciesTypeToTag(button.value as SpeciesType))
    })
    modalBackground.querySelectorAll<ConditionalButton>('#modal-genders condition-button[selected="true"]').forEach(button => {
        tags.push(genderToTag(button.value as Gender))
    })
    modalBackground.querySelectorAll<ConditionalButton>('#modal-relations conditional-button[active="true"][selected="true"]').forEach(button => {
        if (button.value === "") return;
        tags.push(relationsToTag(button.value as Relations))
    })
    modalAddSourceButton.querySelectorAll<ExclusiveButton>('#modal-characters exclusive-button[group-name="modal-character-number"][selected="true"]').forEach(button => {
        tags.push(numberOfCharactersToTag(button.value as NumberOfCharacters))
    })

    tags = tags.concat(
            modalBackground.querySelector<HTMLTextAreaElement>('#modal-characters textarea')!.value.split(' ')
        ).concat(
            modalBackground.querySelector<HTMLTextAreaElement>('#modal-general textarea')!.value.split(' ')
        ).concat(
            modalBackground.querySelector<HTMLTextAreaElement>('#modal-species textarea')!.value.split(' ')
        ).concat(
            modalBackground.querySelector<HTMLTextAreaElement>('#modal-creators textarea')!.value.split(' ')
        )
    

    return tags.filter(t => t.trim() !== "");
}

const bulkTagInfo = async (tags: string[]): Promise<{category: number, post_count: number, name: string}[]> => {
    let list: any[] = [];

    try {
        const response = await fetch(`https://e621.net/tags.json?search[name]=${tags.join(',')}&limit=320`)
        const result = await response.json()

        list = list.concat(result)
    } catch (err) {
        console.log(err)
    }

    return list
}

const secondaryModal = document.getElementById('secondary-modal') as HTMLElement;
const tagPreview = secondaryModal.querySelector('.tag-list') as HTMLElement;
const secondaryModalClose = secondaryModal.querySelector('.modal-bottom button')


const shortenNumber = (n: number): string => {
    if (n === 0) return "0";

    const lookup = [
        {value: 1e9, symbol: "B"},
        {value: 1e6, symbol: "M"},
        {value: 1e3, symbol: "K"}
    ]

    const item = lookup.find(x => Math.abs(n) >= x.value);

    if (!item) {
        return Number(n.toPrecision(3)).toString()
    }

    const scaled = n / item.value
    const formatted = Number(scaled.toPrecision(3))

    return `${formatted}${item.symbol}`
}


document.querySelector<HTMLButtonElement>('#tag-preview-button')?.addEventListener('click', async () => {
    
    const currentTags = aggregateCurrentTags()
    if (currentTags.length === 0) return;

    debouncedTagPreview(currentTags, async (allTags) => {
        const tagInfo = await bulkTagInfo(allTags)

        tagPreview.innerHTML = "";
        tagInfo.forEach(tag => {
            tagPreview.insertAdjacentHTML('beforeend', `
                <div class="tag-preview ${tagTypeNumberToClassName(tag.category)} ${currentTags.includes(tag.name) ? '' : 'implied'}">
                    <p class="tag-preview-name">${tag.name}</p>
                    <p class="tag-preview-count">${shortenNumber(tag.post_count)}</p>
                </div>
            `)
        })

        openSecondaryModal()
    }, () => {})
})

export const openSecondaryModal = () => {
    secondaryModal.classList.remove('modal-hidden')
}

export const closeSecondaryModal = () => {
    secondaryModal.classList.add('modal-hidden')
}

secondaryModalClose?.addEventListener('click', closeSecondaryModal)