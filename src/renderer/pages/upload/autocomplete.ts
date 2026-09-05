

function debounce<T extends (...args: any[]) => void>(callback: T, delay: number): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | undefined;

    return (...args: Parameters<T>) => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            callback(...args)
        }, delay);
    }
}

let autocompleteController: AbortController | undefined;
let tagPreviewController: AbortController | undefined;

async function getAutocomplete(word: string): Promise<AutocompleteSuggestion[] | null> {
    autocompleteController?.abort()

    autocompleteController = new AbortController();

    try {
        const response = await fetch(`https://e621.net/tags/autocomplete.json?expiry=7&search[name_matches]=${word}`, {
            signal: autocompleteController.signal
        });

        if (!response.ok) {
            throw new Error(`Autocomplete request failed: ${response.status}`)
        }

        const result = await response.json()

        return result
    } catch (err) {
        // newer request replaced this one
        if (err instanceof DOMException && err.name === "AbortError") return null;

        console.log(err)
        return null;
    }
}

async function getAutocompleteAndUpdateSuggestions(word: string, textarea: HTMLTextAreaElement) {
    autocompleteController?.abort()

    autocompleteController = new AbortController();

    try {
        const response = await fetch(`https://e621.net/tags/autocomplete.json?expiry=7&search[name_matches]=${word}`, {
            signal: autocompleteController.signal
        });

        if (!response.ok) {
            throw new Error(`Autocomplete request failed: ${response.status}`)
        }

        const result = await response.json()

        updateAutocompleteSuggestions(result, textarea);
    } catch (err) {
        // newer request replaced this one
        if (err instanceof DOMException && err.name === "AbortError") return null;

        console.log(err)
        return null;
    }
}

const secondaryModal = document.getElementById('secondary-modal') as HTMLElement;
const tagPreview = secondaryModal.querySelector('.tag-list') as HTMLElement;
const secondaryModalClose = secondaryModal.querySelector('.modal-bottom button')

async function getTagPreview(tags: string[]): Promise<string[] | null> {
    tagPreviewController?.abort()
    tagPreviewController = new AbortController()

    try {
        const response = await fetch(`https://e621.net/tag_implications.json?search[antecedent_name]=${tags.join(',')}`, {
            signal: tagPreviewController.signal
        })

        if (!response.ok) {
            throw new Error(`Tag Preview request failed: ${response.status}`)
        }

        const result = await response.json()
        if (result.tag_implications) return [];

        let finalTags: Set<string> = new Set<string>();
        result.forEach((r: any) => {
            finalTags.add(r.consequent_name)
            r.descendant_names.forEach((d: string) => {
                finalTags.add(d)
            })
        })

        let tagsArray: string[] = [];
        finalTags.forEach(tag => tagsArray.push(tag))
        tagsArray = tagsArray.concat(tags)
        
        tagPreview.innerHTML = ""
        tagsArray.forEach(tag => {
            tagPreview.insertAdjacentHTML('beforeend', `<div class="tag-preview">${tag}</div>`)
        })
        
        return tagsArray;

    } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return null

        console.log(err)
        return null;
    }
}

export const debouncedAutocomplete = debounce(getAutocomplete, 1000);
export const debouncedAutocompleteAndUpdate = debounce(getAutocompleteAndUpdateSuggestions, 500);
export const debouncedTagPreview = debounce(getTagPreview, 500)


export const getCursorPosition = (textarea: HTMLTextAreaElement): {left: number, top: number} => {
    const mirror = document.createElement('div')
    const marker = document.createElement('span')

    const style = getComputedStyle(textarea)
    const textareaRect = textarea.getBoundingClientRect();

    mirror.style.position = "fixed";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.overflowWrap = 'break-word';

    mirror.style.left = `${textareaRect.left}px`
    mirror.style.top = `${textareaRect.top}px`

    mirror.style.width = `${textarea.clientWidth}`

    mirror.style.font = style.font;
    mirror.style.fontSize = style.fontSize;
    mirror.style.fontFamily = style.fontFamily;
    mirror.style.fontWeight = style.fontWeight;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.letterSpacing = style.letterSpacing;

    mirror.style.padding = style.padding;
    mirror.style.border = style.border;

    mirror.textContent = textarea.value.substring(0, textarea.selectionStart)

    marker.textContent = "\u200b";
    mirror.appendChild(marker)

    document.body.appendChild(mirror);

    const markerRect = marker.getBoundingClientRect();

    const left = markerRect.left - textarea.scrollLeft;
    const top = markerRect.top - textarea.scrollTop;

    mirror.remove()

    return {left, top}    
}

document.querySelectorAll<HTMLTextAreaElement>('.autocomplete-accepted').forEach(auto => {
    auto.addEventListener('keyup', async (event) => {

        const stopKeys = ["Escape", "Tab"];
        if (stopKeys.includes(event.key)) return;

        const cursorPosition = auto.selectionEnd;
        const textBeforeCursor = auto.value.substring(0, cursorPosition)
        const words = textBeforeCursor.split(/\s+/);
        const lastWord = words[words.length - 1]

        if (lastWord.length >= 3) {
            debouncedAutocompleteAndUpdate(lastWord, auto)
        } else {
            hideAutocompleteSuggestions();
        }
    })

    auto.addEventListener('keydown', (event) => {
        if (autocompleteSuggestions.dataset.active !== "true") {
            return;
        }

        switch (event.key) {
            case "Tab":
                event.preventDefault();
                replaceCurrentWord(auto, autocompleteSuggestions.querySelector<HTMLElement>('.autocomplete-suggestion')?.dataset.value ?? "")
                hideAutocompleteSuggestions()
                break;
            case "Escape":
                event.preventDefault();
                event.stopPropagation();
                hideAutocompleteSuggestions()
                break
        }
    })

    auto.addEventListener('blur', (event) => {
        hideAutocompleteSuggestions()
    })
})

const autocompleteSuggestions = document.getElementById('suggestions')!;

autocompleteSuggestions.addEventListener('mousedown', (event) => {
    event.preventDefault()
    event.stopPropagation()
})

const updateAutocompleteSuggestions = (suggestions: AutocompleteSuggestion[], textarea: HTMLTextAreaElement) => {
    const position = getCursorPosition(textarea)

    autocompleteSuggestions.innerHTML = ""
    suggestions.forEach(sug => {
        const item = document.createElement('li')
        item.classList = `autocomplete-suggestion ${tagTypeNumberToClassName(sug.category)}`
        item.innerText = sug.antecedent_name ? `${sug.antecedent_name} -> ${sug.name}` : sug.name;

        item.dataset.value = sug.name

        item.addEventListener('click', () => {
            // replace the current typed word with the value of the suggestion
            console.log("click event fired")
            replaceCurrentWord(textarea, item.dataset.value ?? "")

            hideAutocompleteSuggestions()
        })

        autocompleteSuggestions.appendChild(item)
    })

    autocompleteSuggestions.style.left = `${position.left}px`
    autocompleteSuggestions.style.top = `${position.top + 20}px`
    autocompleteSuggestions.style.width = `${textarea.clientWidth}px`
    autocompleteSuggestions.style.display = "block";
    autocompleteSuggestions.dataset.active = "true"
}

const tagTypeNumberToClassName = (tagTypeNumber: number): string => {
    const map: Map<number, string> = new Map<number, string>([
        [0, "general-tag"],
        [1, "artist-tag"],
        [2, "contributor-tag"],
        [3, "copyright-tag"],
        [4, "character-tag"],
        [5, "species-tag"],
        [6, "invalid-tag"],
        [7, "meta-tag"],
        [8, "lore-tag"]
    ])

    if (!map.has(tagTypeNumber)) return ""

    return map.get(tagTypeNumber)!;
}

const hideAutocompleteSuggestions = () => {
    autocompleteSuggestions.innerHTML = "";
    autocompleteSuggestions.style.display = "none";
    autocompleteSuggestions.dataset.active = "false"
}

const getCurrentWord = (textarea: HTMLTextAreaElement): {word: string, start: number, end: number} => {
    const text = textarea.value;
    const cursor = textarea.selectionStart;

    let start = cursor;
    let end = cursor;

    while (start > 0 && !/\s/.test(text[start-1])) {
        start--;
    }

    while (end < text.length && !/\s/.test(text[end])) {
        end++;
    }

    return {
        word: text.slice(start, end),
        start,
        end
    }
}

const replaceCurrentWord = (textarea: HTMLTextAreaElement, suggestion: string): void => {
    const {start, end} = getCurrentWord(textarea)

    textarea.value = textarea.value.slice(0, start) + suggestion + textarea.value.slice(end)

    const newCursorPosition = start + suggestion.length;

    textarea.selectionStart = newCursorPosition;
    textarea.selectionEnd = newCursorPosition;

    textarea.focus()
}


export const openSecondaryModal = () => {
    secondaryModal.classList.remove('modal-hidden')
}

export const closeSecondaryModal = () => {
    secondaryModal.classList.add('modal-hidden')
}

secondaryModalClose?.addEventListener('click', closeSecondaryModal)