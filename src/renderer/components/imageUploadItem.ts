
import {addToSelected, removeFromSelected, getSizeString} from '../pages/upload/index.js'
import {setCurrentUploadItem, updateModalInfo, writeModalChanges, activateModal} from '../pages/upload/modal.js'

/**
 * An individual image that is going to be uploaded
 */
export class ImageUploadItem extends HTMLElement implements UploadItem {
    constructor() {
        super();
    }

    get path(): string {
        return this.getAttribute('path') ?? "";
    }

    get name(): string {
        return this.getAttribute('name') ?? "";
    }

    get size(): number {
        return Number(this.getAttribute('size')) ?? 0;
    }

    get type(): string {
        return this.getAttribute('type') ?? "";
    }

    set rating(r: 's'|'q'|'e'|'u') {
        this.setAttribute('rating', r)
    }

    get rating(): 's'|'q'|'e'|'u' {
        return (this.getAttribute('rating') ?? 'u') as ('s'|'q'|'e'|'u');
    }

    set creators(c: string[]) {
        this.setAttribute('creators', c.join(' '))
    }

    get creators(): string[] {
        return this.getAttribute('creators')?.split(' ') ?? [];
    }

    set sources(s: string[]) {
        this.setAttribute('sources', s.join(' '))
    }

    get sources(): string[] {
        return this.getAttribute('sources')?.split(' ') ?? []
    }

    set characters(c: string[]) {
        this.setAttribute('characters', c.join(' '))
    }

    get characters(): string[] {
        return this.getAttribute('characters')?.split(' ') ?? []
    }

    set genders(g: Gender[]) {
        this.setAttribute('genders', g.map(gen => gen.toString()).join(' '))
    }

    get genders(): Gender[] {
        return this.getAttribute('genders')?.split(' ').map(s => s as Gender) ?? [];
    }

    set species(s: string[]) {
        this.setAttribute('species', s.join(' '))
    }

    get species(): string[] {
        return this.getAttribute('species')?.split(' ') ?? [];
    }

    set general(g: string[]) {
        this.setAttribute('general', g.join(' '))
    }

    get general(): string[] {
        return this.getAttribute('general')?.split(' ') ?? [];
    }

    set parent(p: string) {
        this.setAttribute('parent', p)
    }

    get parent(): string {
        return this.getAttribute('parent') ?? '';
    }

    set description(d: string) {
        this.setAttribute('description', d)
    }

    get description(): string {
        return this.getAttribute('description') ?? '';
    }

    set relations(r: Relations[]) {
        this.setAttribute('relations', r.map(rel => rel.toString()).join(' '))
    }

    get relations(): Relations[] {
        return this.getAttribute('relations')?.split(' ').map(r => r as Relations) ?? []
    }

    set speciesTypes(sT: SpeciesType[]) {
        this.setAttribute('species-types', sT.map(t => t.toString()).join(' '))
    }

    get speciesTypes(): SpeciesType[] {
        return this.getAttribute('species-types')?.split(' ').map(sT => sT as SpeciesType) ?? []
    }

    set numberOfCharacters(n: NumberOfCharacters) {
        this.setAttribute('number-of-characters', n.toString())
    }

    get numberOfCharacters(): NumberOfCharacters {
        return (this.getAttribute('number-of-characters') as NumberOfCharacters) ?? ("unset" as NumberOfCharacters);
    }

    connectedCallback(): void {
        this.classList.add('upload-item')
        this.dataset.selected = "false"

        this.innerHTML = `
            <div class="upload-item-content">
                <div class="upload-item-content-header">
                    <input type="checkbox" class="upload-item-select-checkbox">
                </div>
                <img src="${this.path}" class="upload-item-media">
            </div>
            <div class="upload-item-footer">
                <p class="upload-item-name">${this.name}</p>
                <div class="upload-item-footer-info">
                    <p class="upload-item-format">${this.type}</p>
                    <p class="upload-item-size">${getSizeString(this.size)}</p>
                </div>
            </div>
        `

        this.addEventListener('become-selected', this.handleSelectEvent)
        this.addEventListener('become-deselected', this.handleDeselectEvent)
        this.addEventListener('click', this.handleClickEvent)
    }


    private handleSelectEvent = (): void => {
        this.dataset.selected = "true"

        const checkBox = this.querySelector<HTMLElement>('.upload-item-select-checkbox') as HTMLInputElement;
        if (checkBox) checkBox.checked = true;

        addToSelected(this);
    }

    private handleDeselectEvent = (): void => {
        this.dataset.selected = "false"

        const checkBox = this.querySelector<HTMLElement>('.upload-item-select-checkbox') as HTMLInputElement;
        if (checkBox) checkBox.checked = false;

        removeFromSelected(this);
    }

    private handleClickEvent = (event: PointerEvent): void => {
        const target = event.target as HTMLElement;

        if (target.closest('img')) {
            this.selectedForModal();
            return;
        }

        const selected = this.dataset.selected === "true";
        if (!selected) {
            this.handleSelectEvent()
        } else {
            this.handleDeselectEvent()
        }
    }

    private selectedForModal() {
        setCurrentUploadItem(this);
        updateModalInfo(
            this,
            'image',
            {
                path: this.path,
                name: this.name,
                type: this.type,
                size: this.size
            }
        );
        activateModal();
    }
}


customElements.define('image-item', ImageUploadItem)