import {SelectableButton} from './selectableButton.js'
import {ConditionButton} from './conditionButton.js'

/**
 * A selectable button that is only active (selectable and visible)
 * when other `ConditionButton`s are selected. All of this button's conditions
 * must be selected for it to be active.
 * @see {@link ConditionButton}
 */
export class ConditionalButton extends SelectableButton {

    autoDeselectOnDeactivation: boolean = true;

    get groupName(): string {
        return this.getAttribute('group-name') ?? ""
    }

    set groupName(g: string) {
        this.setAttribute('group-name', g)
    }

    get active(): boolean {
        return this.getAttribute('active') === "true"
    }

    set active(a: boolean) {
        this.setAttribute('active', a ? "true" : "false")
    }

    get conditions(): string[] {
        return this.getAttribute('conditions')?.split(' ') ?? []
    }

    set conditions(c: string[]) {
        this.setAttribute('conditions', c.join(' '))
    }

    get value(): string {
        if (!this.active) return ""
        return this.value
    }

    connectedCallback() {
        const text = this.textContent?.trim() ?? ""

        this.innerHTML = `
            <button class="selectable-button conditional-button">${text}</button>
        `

        this.addEventListener('click', this.handleClickEvent)
        this.addEventListener('select', this.handleSelectEvent)
        this.addEventListener('deselect', this.handleDeselectEvent)
        this.addEventListener('activate', this.handleActivateEvent)
        this.addEventListener('deactivate', this.handleDeactivateEvent)
    }

    handleSelectEvent() {
        if (!this.active) return;

        this.selected = true
    }

    handleClickEvent() {
        if (!this.active) return;

        if (this.selected) {
            this.handleDeselectEvent()
        } else {
            this.handleSelectEvent()
        }
    }

    handleActivateEvent() {
        this.active = true
    }

    handleDeactivateEvent() {
        this.active = false;
        if (this.autoDeselectOnDeactivation) {
            this.handleDeselectEvent();
        }
    }

    checkForConditionUpdates() {
        let conditionsMet: boolean = true;

        this.conditions.forEach(con => {
            if ( !document.querySelector(`condition-button[group-name="${this.groupName}"][condition-value="${con}"][selected="true"]`) ) {
                conditionsMet = false;
            }
        })

        if (conditionsMet) {
            this.handleActivateEvent()
        } else {
            this.handleDeactivateEvent()
        }
    }
}

customElements.define('conditional-button', ConditionalButton)