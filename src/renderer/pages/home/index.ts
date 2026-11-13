import { SampleModal } from "../../components/modals/sampleModal";
import { StartupModal } from "../../components/modals/startupModal";

console.log("loaded")

// const modal = document.createElement('sample-modal') as SampleModal

// modal.addEventListener('confirmed', () => {
//     console.log("User confirmed!");
// })

// document.body.appendChild(modal);

// modal.open();


const startupModal = document.createElement('startup-modal') as StartupModal

startupModal.addEventListener('confirmed', () => {
    console.log("User confirmed")
})

document.body.appendChild(startupModal);
startupModal.open();