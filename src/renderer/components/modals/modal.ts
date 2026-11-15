
export abstract class Modal extends HTMLElement {
    protected dialog!: HTMLDialogElement;

    private rendered = false;

    constructor() {
        super();

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
        this.innerHTML = `
            <style>
                ${this.getBaseCSS()}
                ${this.getCSS()}
            </style>

            <dialog>
                <div class="modal-container">
                    <div class="modal-content">${this.getHtml()}</div>
                </div>
            </dialog>
        `;

        this.dialog = this.querySelector("dialog")!;

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

    /**
     * Called when the modal is opened.
     */
    protected onOpen(): void {}

    /**
     * Called when the modal is closed.
     */
    protected onClose(): void {}

    open(): void {
        if (!this.dialog.open) {
            this.dialog.showModal()
            this.onOpen();
        }
    }

    close(): void {
        if (this.dialog.open) {
            this.dialog.close()
            this.onClose()
        }
    }

    protected getBaseCSS(): string {
        return `
            dialog {
                border: none;
                border-radius: var(--space-16);
                padding: 0;
                background: transparent;
                color: var(--grey-900);
                max-width: 90vw;
                max-height: 90vh;
            }

            dialog::backdrop {
                background: rgba(0, 0, 0, 0.6);
            }

            .modal-container {
                position: relative;
                background: linear-gradient(var(--grey-50) 0%, var(--grey-100) 20%, var(--grey-200) 90%, var(--grey-300) 100%);
                color: var(--grey-900);
                padding: var(--space-16);
                border-radius: var(--space-8);
            }
        `;
    }
}