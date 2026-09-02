

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

export const debouncedAutocomplete = debounce(getAutocomplete, 1000);

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

document.querySelectorAll<HTMLTextAreaElement>('.autocomplete-input').forEach(auto => {
    auto.addEventListener('keyup', () => {
        const cursorPosition = auto.selectionEnd
        const textBeforeCursor = auto.value.substring(0, cursorPosition)
        const words = textBeforeCursor.split(/\s+/);
        const lastWord = words[words.length - 1]

        if (lastWord.length >= 3) {
            debouncedAutocomplete(lastWord)
        }
    })
})

document.querySelectorAll<HTMLTextAreaElement>('.autocomplete-accepted').forEach(auto => {
    auto.addEventListener('keyup', async (event) => {
        const cursorPosition = auto.selectionEnd;
        const textBeforeCursor = auto.value.substring(0, cursorPosition)
        const words = textBeforeCursor.split(/\s+/);
        const lastWord = words[words.length - 1]

        if (lastWord.length >= 3 && event.code !== "Escape") {

            const suggestions = await getAutocomplete(lastWord)

            if (suggestions) {
                updateAutocompleteSuggestions(suggestions, auto)
            }
        } else {
            hideAutocompleteSuggestions();
        }

    })
})

const autocompleteSuggestions = document.getElementById('suggestions')!;

const updateAutocompleteSuggestions = (suggestions: AutocompleteSuggestion[], textarea: HTMLTextAreaElement) => {
    const position = getCursorPosition(textarea)

    autocompleteSuggestions.innerHTML = ""
    suggestions.forEach(sug => {
        const item = document.createElement('li')
        item.classList = "autocomplete-suggestion"
        item.innerText = sug.name
        autocompleteSuggestions.appendChild(item)
    })

    autocompleteSuggestions.style.left = `${position.left}px`
    autocompleteSuggestions.style.top = `${position.top + 20}px`
    autocompleteSuggestions.style.display = "block";
}

const hideAutocompleteSuggestions = () => {
    autocompleteSuggestions.innerHTML = "";
    autocompleteSuggestions.style.display = "none";
}