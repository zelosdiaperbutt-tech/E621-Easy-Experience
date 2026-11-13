import { Modal } from './modal.js'

export class StartupModal extends Modal {

    protected getHtml(): string {
        return `
            <header>
                <h1>Welcome to E621 Easy Experience</h1>
                <h2>e621 Made Easy</h2>
                <p>Some actions in this application require e621 authorization. This information will not be shared with anyone else.</p>
            </header>
            <section>
                <div class="input-field">
                    <h3>Username</h3>
                    <input type="text" class="auth-username" placeholder="Ex: hexerade">
                </div>
                <div class="input-field">
                    <h3>Auth Token</h3>
                    <input type="text" class="auth-token" placeholder="Ex: 1nHrmzmsvJf26EhU1F7CjnjC">
                    <p class="disclaimer">Your auth token is sensitive information, do not share it with anyone you do not absolutely trust</p>
                </div>
                <div class="flex-group">
                    <button class="button-info skip-button">Skip</button>
                    <button class="button-good save-button">Save</button>    
                </div>
            </section>
        `
    }

    protected getCSS(): string {
        return `

            .modal-container {
                padding: var(--space-48) var(--space-16);
            }

            .modal-content {
                display: flex;
                flex-direction: column;
                gap: var(--space-12);
                align-items: center;
            }

            header {
                flex: 1
                display: flex;
                align-items: center;
                gap: var(--space-4);
                flex-direction: column;
                text-align: center;
                width: 80%;
            }

            header h1 {
                font-size: 1.7rem;
                color: var(--grey-900);
                padding: 0;
                margin: 0 0 var(--space-4) 0;
            }
            
            header h2 {
                font-size: 1.3rem;
                color: var(--grey-800);
                padding: 0;
                margin: 0 0 var(--space-4) 0;
            }
            
            header p {
                font-size: 1rem;
                color: var(--grey-700);
                padding: 0; 
            }
            
            section {
                flex: 2;
                border-radius: var(--space-8);
                display: flex;
                flex-direction: column;
                align-items: stretch;
            }

            .input-field {
                margin: 0 0 var(--space-12) 0;
            }

            .input-field h3 {
                font-weight: bolder;
                font-size: 1.5rem;
                font-weight: 500;
                margin: 0 0 0 0;
            }

            .input-field p.disclaimer {
                font-size: 0.7rem;
                font-style: italic;
                margin: 0;
                color: var(--grey-600);
            }

            .input-field input[type="text"] {
                font-size: 0.8rem;
                font-weight: 500;
                width: 100%;
            }

            section .flex-group {
                justify-content: center;
            }
        `
    }

    protected onRender(): void {
        this.querySelector('.skip-button')!.addEventListener('click', () => {
            this.close();
        });

        this.querySelector('.save-button')!.addEventListener('click', () => {
            const usernameInput = this.querySelector('.auth-username')! as HTMLInputElement;
            const keyInput = this.querySelector('.auth-token')! as HTMLInputElement;

            // might want to make this appear as an error
            if (usernameInput.value.trim() === "" || keyInput.value.trim() === "") return;

            window.saveSecure.saveUsername(usernameInput.value.trim());
            window.saveSecure.saveAPIKey(keyInput.value.trim());

            this.close();
        })
    }
}

customElements.define('startup-modal', StartupModal)