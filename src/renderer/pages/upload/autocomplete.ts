

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

async function getAutocomplete(word: string): Promise<void> {
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

        console.log(result)
    } catch (err) {
        // newer request replaced this one
        if (err instanceof DOMException && err.name === "AbortError") return;

        console.log(err);
    }
}

const debouncedAutocomplete = debounce(getAutocomplete, 1000);

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