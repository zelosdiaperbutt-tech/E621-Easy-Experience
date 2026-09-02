import {SelectableButton} from './selectableButton.js'
import {ConditionalButton} from './conditionalButton.js'

/**
 * A selectable button that acts as a condition for other buttons
 * to be active/selectable. This button is always active.
 * @see {@link ConditionalButton}
 */
export class ConditionButton extends SelectableButton {

    get groupName(): string {
        return this.getAttribute('group-name') ?? ""
    }

    set groupName(g: string) {
        this.setAttribute('group-name', g)
    }

    get conditionValue(): string {
        return this.getAttribute('condition-value') ?? ""
    }

    set conditionValue(cV: string) {
        this.setAttribute('condition-value', cV)
    }

    connectedCallback() {
        const text = this.textContent?.trim() ?? ""

        this.innerHTML = `
            <button class="selectable-button condition-button">${text}</button>
        `

        this.addEventListener('click', this.handleClickEvent)
        this.addEventListener('select', this.handleSelectEvent)
        this.addEventListener('deselect', this.handleDeselectEvent)
    }

    handleClickEvent() {
        if (this.selected) {
            this.handleDeselectEvent()
        } else {
            this.handleSelectEvent()
        }
    }

    handleSelectEvent() {
        this.selected = true
        this.updateConditionalButtons()
    }

    handleDeselectEvent() {
        this.selected = false
        this.updateConditionalButtons()
    }

    updateConditionalButtons() {
        document.querySelectorAll<ConditionalButton>(`conditional-button[group-name="${this.groupName}"]`).forEach(button => {
            button.checkForConditionUpdates()
        })
    }
}

customElements.define('condition-button', ConditionButton)