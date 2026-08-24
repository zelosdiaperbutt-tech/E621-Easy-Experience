
let selectedItems: HTMLElement[] = [];


const addToSelected = (element: HTMLElement) => {
    if (!selectedItems.includes(element)) selectedItems.push(element)

    console.log(selectedItems);
}

const removeFromSelected = (element: HTMLElement) => {
    const index = selectedItems.indexOf(element)
    if (index === -1) return;

    selectedItems.splice(index, 1);
    console.log(selectedItems);
}


document.querySelectorAll<HTMLElement>('.upload-item').forEach((item) => {
    item.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        if (target.closest('img')) return;

        const selected = item.dataset.selected === "true"

        item.dataset.selected = (!selected).toString();
        
        const checkBox = item.querySelector<HTMLElement>('.upload-item-select-checkbox') as HTMLInputElement;
        if (checkBox) checkBox.checked = !selected;

        if (!selected) {    // the element is being selected
            addToSelected(item)
        } else if (selected) {  // the element is being deselected
            removeFromSelected(item)
        }
    })
})