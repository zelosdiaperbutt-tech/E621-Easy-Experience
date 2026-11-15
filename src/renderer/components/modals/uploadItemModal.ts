import { Modal } from "./modal.js";
import { itemManager } from "../../pages/upload/itemManager.js";

import { SelectableButton } from "../selectableButton";
import { ExclusiveButton } from "../exclusiveButton";
import { ConditionButton } from "../conditionButton";
import { ConditionalButton } from "../conditionalButton";
import { getSizeString } from "../../pages/upload/index.js";
import { createNewModalSource } from "../../pages/upload/modal.js";

export class UploadItemModal extends Modal {

    static readonly ratingShorthand: Map<string, string> = new Map<string, string>([
        ['e', 'explicit'],
        ['q', 'questionable'],
        ['s', 'safe'],
        ['u', 'unset']
    ]); 

    static readonly ratingLonghand: Map<string, string> = new Map<string, string>([
        ['safe', 's'],
        ['questionable', 'q'],
        ['explicit', 'e']
    ])

    private currentUploadItem: UploadItem | null = null;

    public setCurrentUploadItem(item: UploadItem): void {
        this.currentUploadItem = item;
    }

    public updateModalInfo(uploadElement: UploadItem, type: 'image' | 'video', info: FileInfo): void {
        // get all the elements at the start.
        // replacement for old code that had references at the top of file, but that likely won't work here.
        const modalBackground = this.querySelector('[data-id="modal-background"]') as HTMLElement
        const modalSourceInputs = this.querySelector('[data-id="modal-sources-inputs"]') as HTMLElement
        const modalAddSourceButton = this.querySelector('[data-id="modal-add-source"]') as HTMLButtonElement
        const modalContentContainer = this.querySelector('[data-id="content-container"]') as HTMLElement
        const modalNavigatePrevious = this.querySelector('[data-id="modal-navigate-previous"]') as HTMLButtonElement
        const modalNavigateNext = this.querySelector('[data-id="modal-navigate-next"]') as HTMLButtonElement
        const itemGrid = document.getElementById('upload-main-area-grid') as HTMLElement

        // Actual code start
        modalContentContainer.innerHTML = ""
        if (type === 'image') {
            const imageElement = document.createElement('img')
            imageElement.setAttribute('src', info.path)
            modalContentContainer.insertAdjacentElement("beforeend", imageElement)
        } else {
            const videoElement = document.createElement('video')
            videoElement.setAttribute('src', info.path)
            videoElement.controls = true;
            modalContentContainer.insertAdjacentElement('beforeend', videoElement)
        }

        modalBackground.querySelector<HTMLParagraphElement>('[data-id="modal-navigate-item-id"]')!.innerText = `ID #${uploadElement.itemID}`

        // display file information
        modalBackground.querySelector<HTMLElement>('[data-id="left-modal"] .content-name')!.innerText = info.name;
        modalBackground.querySelector<HTMLElement>('[data-id="left-modal"] .format')!.innerText = info.type;
        modalBackground.querySelector<HTMLElement>('[data-id="left-modal"] .file-size')!.innerText = getSizeString(info.size)

        // set the active rating
        if (uploadElement.rating !== 'u') {
            let ratingButton: ExclusiveButton = modalBackground.querySelector<ExclusiveButton>(`exclusive-button[group-name="modal-rating-button"][value="${UploadItemModal.ratingShorthand.get(uploadElement.rating)}"]`)!;
            ratingButton.dispatchEvent(new Event('select'))
        } else {
            modalBackground.querySelectorAll<ExclusiveButton>('exclusive-button[group-name="modal-rating-button"]').forEach(button => {
                button.dispatchEvent(new Event('deselect'))
            })
        }

        uploadElement.speciesTypes.forEach(species => {
            modalBackground.querySelector<SelectableButton>(`selectable-button[value="${species.toString()}"]`)?.dispatchEvent(new Event('select'))
        })

        uploadElement.genders.forEach(gender => {
            modalBackground.querySelector(`condition-button[group-name="modal-relations"][value="${gender.toString()}"]`)?.dispatchEvent(new Event('select'))
        })

        uploadElement.relations.forEach(relation => {
            modalBackground.querySelector(`conditional-button[group-name="modal-relations"][value="${relation.toString()}"]`)?.dispatchEvent(new Event('select'));
        })

        if (uploadElement.numberOfCharacters !== ('unset' as NumberOfCharacters)) {
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
            const sourceElement = createNewModalSource('')
            modalSourceInputs.insertAdjacentElement('beforeend', sourceElement)
        }

        modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-characters"] textarea')!.value = uploadElement.characters.join(' ')
        modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-general"] textarea')!.value = uploadElement.general.join(' ')
        modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-species"] textarea')!.value = uploadElement.species.join(' ')
        modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-creators"] textarea')!.value = uploadElement.creators.join(' ')
        modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-description"] textarea')!.value = uploadElement.description
        modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-parent"] input[type="text"]')!.value = uploadElement.parent
    }

    public writeModalChanges(currentItem: UploadItem): void {
        // get all the elements at the start.
        // replacement for old code that had references at the top of file, but that likely won't work here.
        const modalBackground = this.querySelector('[data-id="modal-background"]') as HTMLElement
        const modalSourceInputs = this.querySelector('[data-id="modal-sources-inputs"]') as HTMLElement
        const modalAddSourceButton = this.querySelector('[data-id="modal-add-source"]') as HTMLButtonElement
        const modalContentContainer = this.querySelector('[data-id="content-container"]') as HTMLElement
        const modalNavigatePrevious = this.querySelector('[data-id="modal-navigate-previous"]') as HTMLButtonElement
        const modalNavigateNext = this.querySelector('[data-id="modal-navigate-next"]') as HTMLButtonElement
        const itemGrid = document.getElementById('upload-main-area-grid') as HTMLElement
    
        const selectedRating = modalBackground.querySelector<ExclusiveButton>('exclusive-button[group-name="modal-rating-button"][selected="true"]')
        if (selectedRating) {
            currentItem.rating = (UploadItemModal.ratingLonghand.get(selectedRating.value)) as 'e'|'q'|'s'|'u'
        } else {
            currentItem.rating = 'u'
        }

        let speciesTypes: SpeciesType[] = [];
        modalBackground.querySelectorAll<SelectableButton>('[data-id="modal-species-types"] selectable-button[selected="true"]').forEach(button => {
            speciesTypes.push(button.value as SpeciesType)
        })
        currentItem.speciesTypes = speciesTypes;

        let genders: Gender[] = [];
        modalBackground.querySelectorAll<SelectableButton>('[data-id="modal-genders"] condition-button[selected="true"]').forEach(button => {
            genders.push(button.value as Gender)
        })
        currentItem.genders = genders;

        let relations: Relations[] = []
        modalBackground.querySelectorAll<ConditionButton>('[data-id="modal-relations"] conditional-button[active="true"][selected="true"]').forEach(button => {
            if (button.value === "") return;
            relations.push(button.value as Relations)
        })
        currentItem.relations = relations

        const selectedNumberOfCharacters = modalBackground.querySelector<ExclusiveButton>('[data-id="modal-characters"] exclusive-button[group-name="modal-character-number"][selected="true"]')
        if (selectedNumberOfCharacters) {
            currentItem.numberOfCharacters = (selectedNumberOfCharacters.value as NumberOfCharacters)
        } else {
            currentItem.numberOfCharacters = ('unset' as NumberOfCharacters)
        }

        let sources: string[] = [];
        modalSourceInputs.querySelectorAll<HTMLInputElement>('input[type="text"]').forEach(source => {
            if (source.value && source.value.trim() !== "") sources.push(source.value)
        })
        currentItem.sources = sources;

        currentItem.characters = modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-characters"] textarea')!.value.split(' ')
        currentItem.general = modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-general"] textarea')!.value.split(' ')
        currentItem.species = modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-species"] textarea')!.value.split(' ')
        currentItem.creators = modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-creators"] textarea')!.value.split(' ')
        currentItem.description = modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-description"] textarea')!.value
        currentItem.parent = modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-parent"] input[type="text"]')!.value

        itemManager.saveAllItems(itemGrid);
    }

    private navigatePrevious(): void { }
    private navigateNext(): void { }

    private clearModal(): void {
        const modalBackground = this.querySelector('[data-id="modal-background"]') as HTMLElement
        const modalSourceInputs = this.querySelector('[data-id="modal-sources-inputs"]') as HTMLElement

        modalBackground.querySelectorAll<HTMLElement>('.selectable-button').forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
        modalBackground.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(textArea => {
            textArea.value = ""
        })
        modalBackground.querySelectorAll<HTMLInputElement>('input[type="text"]').forEach(input => {
            input.value = "";
        })
        modalBackground.querySelectorAll<SelectableButton>('selectable-button').forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
        modalBackground.querySelectorAll<ConditionButton>('condition-button').forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
        modalBackground.querySelectorAll<ConditionalButton>('conditional-button').forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
        modalBackground.querySelector<HTMLParagraphElement>('[data-id="modal-navigate-item-id"]')!.innerHTML = "ID: #___"
        modalSourceInputs.innerHTML = "";
    }

    //---------------------------------//
    //      Inherited Modal            //
    //---------------------------------//

    protected onClose(): void {
        this.currentUploadItem = null;
        this.clearModal();
    }

    protected getHtml(): string {
        return `
        <div data-id="modal-background"> <!-- modal-hidden -->
            <div role="dialog" aria-modal="true">

                <header data-id="modal-header">
                    <div data-id="modal-navigation-buttons">
                        <button data-id="modal-navigate-previous">&leftarrow; Previous</button>
                        <p data-id="modal-navigate-item-id">ID: #___</p>
                        <button data-id="modal-navigate-next">Next &rightarrow;</button>
                    </div>
                </header>

                <div class="modal-section" data-id="left-modal">
                    <div data-id="content-container">
                        <img src="https://media.istockphoto.com/id/1486674561/photo/young-woman-taking-a-selfie.jpg?s=612x612&w=0&k=20&c=ZbH8PakbBL8UAFhvsFSRAWXJakqz92UgnFFxRC3ucj0=">
                    </div>
                    <div data-id="content-information">
                        <p class="content-name">Example</p>
                        <p class="format">Format</p>
                        <p class="file-size">00.0 B</p>
                    </div>
                    <div class="modal-section" data-id="modal-sources">
                        <div class="flex-group">
                            <p>Sources</p>
                            <button data-id="modal-add-source">Add Source</button>
                        </div>
                        <div class="input-list" data-id="modal-sources-inputs"></div>
                    </div>
                </div>

                <div class="modal-section" data-id="modal-rating">
                    <h3>Rating</h3>
                    <div class="flex-group-wrap">
                        <exclusive-button group-name="modal-rating-button" value="explicit">Explicit</exclusive-button>
                        <exclusive-button group-name="modal-rating-button" value="questionable">Questionable</exclusive-button>
                        <exclusive-button group-name="modal-rating-button" value="safe">Safe</exclusive-button>
                    </div>
                </div>

                <div class="modal-section" data-id="modal-characters">
                    <h3>Characters</h3>
                    <div class="flex-group scroll">
                        <exclusive-button group-name="modal-character-number" value="zero">Zero</exclusive-button>
                        <exclusive-button group-name="modal-character-number" value="solo">Solo</exclusive-button>
                        <exclusive-button group-name="modal-character-number" value="duo">Duo</exclusive-button>
                        <exclusive-button group-name="modal-character-number" value="trio">Trio</exclusive-button>
                        <exclusive-button group-name="modal-character-number" value="group">Group</exclusive-button>
                    </div>
                    <textarea class="autocomplete-accepted"></textarea>
                </div>
                <div class="modal-section" data-id="modal-relationships">
                    <div class="flex-group scroll" data-id="modal-genders">
                        <condition-button group-name="modal-relations" value="male" condition-value="male">Male</condition-button>
                        <condition-button group-name="modal-relations" value="female" condition-value="female">Female</condition-button>
                        <condition-button group-name="modal-relations" value="andromorph" condition-value="andromorph">Andromorph</condition-button>
                        <condition-button group-name="modal-relations" value="gynomorph" condition-value="gynomorph">Gynomorph</condition-button>
                        <condition-button group-name="modal-relations" value="hermaphrodite" condition-value="hermaphrodite">Hermaphrodite</condition-button>
                        <condition-button group-name="modal-relations" value="male-herm" condition-value="male-herm">Male-Herm</condition-button>
                        <condition-button group-name="modal-relations" value="ambiguous" condition-value="ambiguous">Ambiguous</condition-button>
                    </div>
                    <div class="flex-group scroll" data-id="modal-relations">
                        <conditional-button group-name="modal-relations" value="m/m" conditions="male">Male/Male</conditional-button>
                        <conditional-button group-name="modal-relations" value="m/f" conditions="male female">Male/Female</conditional-button>
                        <conditional-button group-name="modal-relations" value="m/and" conditions="male andromorph">Male/Andromorph</conditional-button>
                        <conditional-button group-name="modal-relations" value="m/gyn" conditions="male gynomorph">Male/Gynomorph</conditional-button>
                        <conditional-button group-name="modal-relations" value="m/herm" conditions="male hermaphrodite">Male/Hermaphrodite</conditional-button>
                        <conditional-button group-name="modal-relations" value="m/mherm" conditions="male male-herm">Male/Male-Herm</conditional-button>
                        <conditional-button group-name="modal-relations" value="m/amb" conditions="male ambiguous">Male/Ambiguous</conditional-button>
                        <conditional-button group-name="modal-relations" value="f/f" conditions="female">Female/Female</conditional-button>
                        <conditional-button group-name="modal-relations" value="f/and" conditions="female andromorph">Female/Andromorph</conditional-button>
                        <conditional-button group-name="modal-relations" value="f/gyn" conditions="female gynomorph">Female/Gynomorph</conditional-button>
                        <conditional-button group-name="modal-relations" value="f/herm" conditions="female hermaphrodite">Female/Hermaphrodite</conditional-button>
                        <conditional-button group-name="modal-relations" value="f/mherm" conditions="female male-herm">Female/Male-Herm</conditional-button>
                        <conditional-button group-name="modal-relations" value="f/amb" conditions="female ambiguous">Female/Ambiguous</conditional-button>
                        <conditional-button group-name="modal-relations" value="and/and" conditions="andromorph">Andromorph/Andromorph</conditional-button>
                        <conditional-button group-name="modal-relations" value="and/gyn" conditions="andromorph gynomorph">Andromorph/Gynomorph</conditional-button>
                        <conditional-button group-name="modal-relations" value="and/herm" conditions="andromorph hermaphrodite">Andromorph/Hermaphrodite</conditional-button>
                        <conditional-button group-name="modal-relations" value="and/mherm" conditions="andromorph male-herm">Andromorph/Male-Herm</conditional-button>
                        <conditional-button group-name="modal-relations" value="and/amb" conditions="andromorph ambiguous">Andromorph/Ambiguous</conditional-button>
                        <conditional-button group-name="modal-relations" value="gyn/gyn" conditions="gynomorph">Gynomorph/Gynomorph</conditional-button>
                        <conditional-button group-name="modal-relations" value="gyn/herm" conditions="gynomorph hermaphrodite">Gynomorph/Hermaphrodite</conditional-button>
                        <conditional-button group-name="modal-relations" value="gyn/mherm" conditions="gynomorph male-herm">Gynomorph/Male-Herm</conditional-button>
                        <conditional-button group-name="modal-relations" value="gyn/amb" conditions="gynomorph ambiguous">Gynomorph/Ambiguous</conditional-button>
                        <conditional-button group-name="modal-relations" value="herm/herm" conditions="hermaphrodite">Hermaphrodite/Hermaphrodite</conditional-button>
                        <conditional-button group-name="modal-relations" value="herm/mherm" conditions="hermaphrodite male-herm">Hermaphrodite/Male-Herm</conditional-button>
                        <conditional-button group-name="modal-relations" value="herm/amb" conditions="hermaphrodite ambiguous">Hermaphrodite/Ambiguous</conditional-button>
                        <conditional-button group-name="modal-relations" value="mherm/mherm" conditions="male-herm">Male-Herm/Male-Herm</conditional-button>
                        <conditional-button group-name="modal-relations" value="mherm/amb" conditions="male-herm ambiguous">Male-Herm/Ambiguous</conditional-button>
                        <conditional-button group-name="modal-relations" value="amb/amb" conditions="ambiguous">Ambiguous/Ambiguous</conditional-button>
                    </div>
                </div>
                <div class="modal-section" data-id="modal-species">
                    <h3>Species</h3>
                    <div class="flex-group scroll" data-id="modal-species-types">
                        <selectable-button value="anthro">Anthro</selectable-button>
                        <selectable-button value="feral">Feral</selectable-button>
                        <selectable-button value="humanoid">Humanoid</selectable-button>
                        <selectable-button value="human">Human</selectable-button>
                        <selectable-button value="taur">Taur</selectable-button>
                    </div>
                    <textarea class="autocomplete-accepted"></textarea>
                </div>
                
                <div class="modal-section" data-id="modal-general">
                    <h3>General</h3>
                    <textarea class="autocomplete-accepted"></textarea>
                </div>

                <div class="modal-section" data-id="modal-description">
                    <h3>Description</h3>
                    <textarea></textarea>
                </div>
                
                <div class="modal-section" data-id="modal-creators">
                    <h3>Creators</h3>
                    <textarea class="autocomplete-accepted"></textarea>
                </div>

                <div class="modal-section" data-id="modal-parent">
                    <h3>Parent</h3>
                    <input type="text" data-id="" placeholder="Ex: 12345">
                </div>
                
                <footer data-id="modal-footer">
                    <button data-id="tag-preview-button">Tag Preview</button>
                    <button class="button-danger" data-id="modal-cancel-button">Cancel</button>
                    <button class="button-good" data-id="modal-confirm-button">Confirm</button>

                </footer>
            </div>
        </div>`
    }

    protected getCSS(): string {
        return ``
    }

    protected onRender(): void {
        this.querySelector('[data-id="modal-confirm-button"]')!.addEventListener('click', () => {
            if (this.currentUploadItem) {
                this.writeModalChanges(this.currentUploadItem);
            }

            this.close();
        })

        this.querySelector('[data-id="modal-cancel-button"]')!.addEventListener('click', () => {
            this.close();
        })

        this.querySelector('[data-id="modal-add-source"]')?.addEventListener('click', () => {
            
            const modalSourceInputs = this.querySelector('[data-id="modal-sources-inputs"]') as HTMLElement
            const newSource = createNewModalSource()
            modalSourceInputs.insertAdjacentElement('beforeend', newSource)

        })
    }
}

customElements.define('upload-item-modal', UploadItemModal)