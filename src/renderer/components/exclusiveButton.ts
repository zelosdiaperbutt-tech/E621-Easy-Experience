import {SelectableButton} from './selectableButton.js'

export class ExclusiveButton extends SelectableButton {

    constructor() {
        super()
    }

    set groupname(g: string) {
        this.setAttribute('group-name', g)
    }

    get groupname(): string {
        return this.getAttribute('group-name') ?? '';
    }

    connectedCallback() {
        const text = this.textContent?.trim() ?? "";

        this.innerHTML = `
            <button class="selectable-button exclusive-selectable-button">${text}</button>
        `

        this.addEventListener('select', this.handleSelectEvent)
        this.addEventListener('deselect', this.handleDeselectEvent)
        this.addEventListener('exclusive', this.handleExclusiveEvent)
        this.addEventListener('click', this.handleClickEvent)
    }

    handleExclusiveEvent() {
        document.querySelectorAll<ExclusiveButton>(`exclusive-button[group-name="${this.groupname}"]`).forEach(button => {
            button.dispatchEvent(new Event('deselect'))
        })
    }

    handleClickEvent() {
        if (this.selected) {
            this.handleDeselectEvent()
        } else {
            this.handleExclusiveEvent()
            this.handleSelectEvent()
        }
    }
}

customElements.define('exclusive-button', ExclusiveButton)