import { Modal } from "./modal.js"

export class SampleModal extends Modal {
    protected getHtml(): string {
        return `
            <h2>Confirm Action</h2>
            <p>Are yoiu sure you want to continue?</p>
            <div class="buttons">
                <button id="cancel">Cancel</button>
                <button id="confirm">Confirm</button>
            </div>
        `
    }

    protected getCSS(): string {
        return `
            .buttons {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            
            #confirm {
                background: var(--blue-600);
                color: white;
            }
        `
    }

    protected onRender(): void {
        this.querySelector("#cancel")!
            .addEventListener('click', () => {this.close()})
        
        this.querySelector("#confirm")!
            .addEventListener('click', () => {
                this.dispatchEvent(
                    new CustomEvent('confirmed', {bubbles: true, composed: true})
                )
                this.close();
            })
    }
}

customElements.define('sample-modal', SampleModal);