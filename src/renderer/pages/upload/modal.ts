const modalBackground = document.getElementById('modal-background') as HTMLElement;

import {getSizeString} from './index.js'
import {ItemUpload} from '../../components/itemUpload.js'
import {SelectableButton} from '../../components/selectableButton.js'
import { ExclusiveButton } from '../../components/exclusiveButton.js';

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

let currentUploadItem: ItemUpload | null;

export const setCurrentUploadItem = (item: ItemUpload): void => {
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
    uploadElement: ItemUpload,
    type: 'image'|'video',
    info: FileInfo
) => {
    if (type === 'image') {
        modalBackground.querySelector<HTMLImageElement>('#content-container img')!.src = info.path;
    } else {
        throw new Error('Video file types not implemented')
    }

    document.querySelector<HTMLElement>('#left-modal .content-name')!.innerText = info.name;
    document.querySelector<HTMLElement>('#left-modal .format')!.innerText = info.type;
    document.querySelector<HTMLElement>('#left-modal .file-size')!.innerText = getSizeString(info.size);


    const ratingShorthandConvertion: Map<string, string> = new Map<string, string>();
    ratingShorthandConvertion.set("e", "explicit");
    ratingShorthandConvertion.set("q", "questionable");
    ratingShorthandConvertion.set("s", "safe");
    ratingShorthandConvertion.set("u", "unset");
    
    if (uploadElement.rating !== 'u') {
        let ratingButton: HTMLButtonElement = document.querySelector<HTMLButtonElement>(`button.selectable-button.exclusive-selectable-button[data-groupname="modal-rating-button"][data-value="${ratingShorthandConvertion.get(uploadElement.rating)}"]`) as HTMLButtonElement;
        ratingButton.dispatchEvent(new Event('exclusive'))
        ratingButton.dispatchEvent(new Event('select'))
    } else {
        document.querySelectorAll<HTMLElement>('button[data-groupname="modal-rating-button"]').forEach(button => {
            button.dispatchEvent(new Event('deselect'));
        })       
    }

    uploadElement.speciesTypes.forEach(species => {
        document.querySelector<SelectableButton>(`selectable-button[value="${species.toString()}"`)?.dispatchEvent(new Event('select'))
    })
    
    uploadElement.genders.forEach(gender => {
        document.querySelector(`button.selectable-button.condition-button[data-groupname="modal-relations"][data-value="${gender.toString()}"]`)?.dispatchEvent(new Event('select'));
    })
    document.querySelectorAll<HTMLButtonElement>('button.selectable-button.conditionally-active[data-groupname="modal-relations"]').forEach(button => {
        button.dispatchEvent(new Event('potential-condition-change'))
    })

    uploadElement.relations.forEach(relation => {
        document.querySelector(`button.selectable-button.conditionally-active[data-groupname="modal-relations"][data-value="${relation.toString()}"]`)?.dispatchEvent(new Event('select'));
    })

    if (uploadElement.numberOfCharacters !== ("unset" as NumberOfCharacters)) {
        let numberOfCharactersButton: HTMLButtonElement = modalBackground.querySelector<HTMLButtonElement>(`#modal-characters button[data-groupname="modal-character-number"][data-value="${uploadElement.numberOfCharacters.toString()}"]`) as HTMLButtonElement;
        numberOfCharactersButton.dispatchEvent(new Event('exclusive'))
        numberOfCharactersButton.dispatchEvent(new Event('select'))
    } else {
        modalBackground.querySelectorAll<HTMLButtonElement>('#modal-characters button[data-groupname="modal-character-number"]').forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
    }

    modalBackground.querySelector<HTMLTextAreaElement>('#modal-characters textarea')!.innerText = uploadElement.characters.join(' ')
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-general textarea')!.innerText = uploadElement.general.join(' ')
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-species textarea')!.innerText = uploadElement.species.join(' ')
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-creators textarea')!.innerText = uploadElement.creators.join(' ')
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-description')!.innerText = uploadElement.description
    modalBackground.querySelector<HTMLTextAreaElement>('#modal-parent input[type="text"]')!.value = uploadElement.parent
}

/**
 * Updates the currently selected element's attributes and properties to affect the
 * selected buttons and typed text on the modal.
 * @todo Finish Implementation
 */
export const writeModalChanges = () => {

}

/**
 * Displays the modal with the information it currenly has.
 * To update its information, call `updateModalInfo()` beforehand.
 * @see {@link updateModalInfo}
 */
export const activateModal = () => {
    modalBackground.dispatchEvent(new Event('show'))
}

/**
 * Called when the modal needs to be closed, prevents changes to the previous element
 * from mistakenly being carried over to the next element.
 */
const closeModal = () => {
    modalBackground.querySelectorAll<HTMLElement>('.selectable-button').forEach(button => {
        button.dispatchEvent(new Event('deselect'))
    })
    modalBackground.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(textArea => {
        textArea.innerText = "";
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
}

// "Conditionally Active" buttons require that one or more conditional buttons
// be selected in order to be available to the user. Being available does not
// automatically mean that it is selected/chosen. This kinds of button's
// 'data-selected' attribute should only be read if its 'data-active' attribute
// is set to "true".
document.querySelectorAll<HTMLButtonElement>('button.conditionally-active').forEach(button => {
    button.addEventListener('activate', () => {
        button.dataset.active = "true"
    })

    button.addEventListener('deactivate', () => {
        button.dataset.active = "false"
    })
    
    button.addEventListener('potential-condition-change', () => {
        const groupName = button.dataset.groupname;
        const conditionValues = button.dataset.conditions?.split(' ')
        
        let conditionsMet: boolean = true;

        conditionValues?.forEach(condition => {
            if (!document.querySelector(`.condition-button[data-groupname="${groupName}"][data-conditionvalue="${condition}"][data-selected="true"]`)) {
                conditionsMet = false
            }
        })

        if (conditionsMet) {
            button.dispatchEvent(new Event('activate'))
        } else {
            button.dispatchEvent(new Event('deactivate'))
        }
    })
})

// "Conditional buttons" are buttons that represent required conditions for another
// selectable button to be available. 
document.querySelectorAll<HTMLButtonElement>('button.condition-button').forEach(button => {
    button.addEventListener('click', () => {
        const groupName = button.dataset.groupname;

        document.querySelectorAll(`button.conditionally-active[data-groupname="${groupName}"]`).forEach(b => {
            b.dispatchEvent(new Event('potential-condition-change'))
        })
    })
})