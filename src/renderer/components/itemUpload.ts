
import {addToSelected, removeFromSelected} from '../pages/upload/index.js'

/**
 * An individual item that is going to be uploaded
 */
export class ItemUpload extends HTMLElement {
    constructor() {
        super();
    }

    get path(): string {
        return this.getAttribute('path') ?? "";
    }

    get name(): string {
        return this.getAttribute('name') ?? "";
    }

    get size(): string {
        return this.getAttribute('size') ?? "";
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
        this.setAttribute('character', c.join(' '))
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

    set numberOfCharacters(n: number) {
        this.setAttribute('number-of-characters', n.toString())
    }

    get numberOfCharacters(): number {
        return Number(this.getAttribute('number-of-characters')) ?? 0
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
            <div class="tag-section always-hidden" data-rating="u">
                <div class="creator-tags"></div>
                <div class="sources"></div>
                <div class="character-tags"></div>
                <div class="gender-tags"></div>
                <div class="species-tags"></div>
                <div class="general-tags"></div>
                <div class="parent-post" data-needsResolution="false"></div>
                <div class="description"></div>
            </div>
            <div class="upload-item-footer">
                <p class="upload-item-name">${this.name}</p>
                <div class="upload-item-footer-info">
                    <p class="upload-item-format">${this.type}</p>
                    <p class="upload-item-size">${this.size}</p>
                </div>
            </div>
        `

        this.addEventListener('become-selected', this.handleSelectEvent)
        this.addEventListener('become-deselected', this.handleDeselectEvent)
        this.addEventListener('click', this.handleClickEvent)
    }


    private handleSelectEvent = (): void => {
        console.log("select event fired")
        this.dataset.selected = "true"

        const checkBox = this.querySelector<HTMLElement>('.upload-item-select-checkbox') as HTMLInputElement;
        if (checkBox) checkBox.checked = true;

        addToSelected(this);
    }

    private handleDeselectEvent = (): void => {
        console.log("deselect event fired")
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


customElements.define('item-upload', ItemUpload)