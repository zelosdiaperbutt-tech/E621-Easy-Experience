
export abstract class Modal extends HTMLElement {
    protected shadow: ShadowRoot;
    protected dialog!: HTMLDialogElement;

    private rendered = false;

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback(): void {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    /**
     * HTML supplied by individual modal.
     */
    protected abstract getHtml(): string;

    protected getCSS(): string {
        return "";
    }

    private render(): void {
        this.shadow.innerHTML = `
            <style>
                ${this.getBaseCSS()}
                ${this.getCSS()}
            </style>

            <dialog>
                <div class="modal-container">
                    <button class="close-button" type="button">&times;</button>
                    <div class="modal-content">${this.getHtml()}</div>
                </div>
            </dialog>
        `;

        this.dialog = this.shadow.querySelector("dialog")!;
        this.dialog
            .querySelector('.close-button')!
            .addEventListener('click', () => {this.close()})

        this.dialog.addEventListener('click', (event) => {
            if (event.target === this.dialog) {
                this.close()
            }
        })

        this.onRender();
    }

    /**
     * Called after the HTML has been inserted.
     * Individual modals can override this to register listeners.
     */
    protected onRender(): void { }

    open(): void {
        if (!this.dialog.open) {
            this.dialog.showModal()
        }
    }

    close(): void {
        if (this.dialog.open) {
            this.dialog.close()
        }
    }

    protected getBaseCSS(): string {
        return `
            dialog {
                border: none;
                border-radius: 10px;
                padding: 0;
                background: transparent;
                color: inherit;
                max-width: 90vw;
                max-height: 90vh;
            }

            dialog::backdrop {
                background: rgba(0, 0, 0, 0.6);
            }

            .modal-container {
                position: relative;
                background: #252525;
                color: white;
                padding: 24px;
                border-radius: 10px;
            }

            .close-button {
                position: absolute;
                top: 10px;
                right: 10px;
            }
        `;
    }
}