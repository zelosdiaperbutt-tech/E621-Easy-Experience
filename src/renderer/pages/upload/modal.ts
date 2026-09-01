const modalBackground = document.getElementById('modal-background') as HTMLElement;

import {getSizeString} from './index.js'

modalBackground.addEventListener('show', () => {
    modalBackground.classList.remove('modal-hidden')
})

modalBackground.addEventListener('hide', () => {
    modalBackground.classList.add('modal-hidden')
    currentUploadItem = null
})

modalBackground.addEventListener('click', (event) => {
    if (event.target === modalBackground) {
        modalBackground.dispatchEvent(new Event('hide'))
    }
})

let currentUploadItem: HTMLElement | null;

export const setCurrentUploadItem = (item: HTMLElement): void => {

}

export const updateModalInfo = (
    url: string,
    type: 'image'|'video',
    rating: 's'|'q'|'e'|'u',
    sources: string[],
    creators: string[],
    options: {
        info: FileInfo | null,
        characters: string[] | null,
        numberOfCharacters: number | null,
        genders: Gender[] | null,
        relations: Relations[] | null,
        species: string[] | null,
        speciesTypes: SpeciesType[] | null,
        general: string[] | null,
        description: string | null,
        parent: number | null
    }
) => {
    if (type === 'image') {
        modalBackground.querySelector<HTMLImageElement>('#content-container img')!.src = url;
    } else {
        throw new Error('Video file types not implemented')
    }


}

export const writeModalChanges = () => {

}

export const toggleModal = () => {

}



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

document.querySelectorAll<HTMLButtonElement>('button.condition-button').forEach(button => {
    button.addEventListener('click', () => {
        const groupName = button.dataset.groupname;

        document.querySelectorAll(`button.conditionally-active[data-groupname="${groupName}"]`).forEach(b => {
            b.dispatchEvent(new Event('potential-condition-change'))
        })
    })
})