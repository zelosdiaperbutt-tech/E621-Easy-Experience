import { SampleModal } from "../../components/modals/sampleModal";

console.log("loaded")

const modal = document.createElement('sample-modal') as SampleModal

modal.addEventListener('confirmed', () => {
    console.log("User confirmed!");
})

document.body.appendChild(modal);

modal.open();

export const useless = () => {
    console.log("useless")
}