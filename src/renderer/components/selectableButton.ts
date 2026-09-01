
export class SelectableButton extends HTMLElement {

    constructor() {
        super()
    }

    get selected(): boolean {
        return this.getAttribute('selected') === "true";
    }

    set selected(s: boolean) {
        this.setAttribute('selected', s ? "true" : "false")
    }

    get value(): string {
        return this.getAttribute('value') ?? ''
    }

    set value(s: string) {
        this.setAttribute('value', s)
    }

    connectedCallback() {
        const text = this.textContent?.trim() ?? "";

        this.innerHTML = `
            <button class="selectable-button">${text}</button>
        `

        this.addEventListener('click', this.handleClickEvent)
        this.addEventListener('select', this.handleSelectEvent)
        this.addEventListener('deselect', this.handleDeselectEvent)
    }

    handleSelectEvent() {
        this.selected = true;
    }

    handleDeselectEvent() {
        this.selected = false
    }

    handleClickEvent() {
        if (this.selected) {
            this.handleDeselectEvent()
        } else {
            this.handleSelectEvent()
        }
    }
}

customElements.define('selectable-button', SelectableButton)