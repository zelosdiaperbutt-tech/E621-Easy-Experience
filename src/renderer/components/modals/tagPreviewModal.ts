import { ConditionalButton } from '../conditionalButton.js';
import { ExclusiveButton } from '../exclusiveButton.js';
import { SelectableButton } from '../selectableButton.js';
import { Modal } from './modal.js'
import { debouncedTagPreview, tagTypeNumberToClassName } from '../../pages/upload/autocomplete.js';

enum Gender {
    Male = "male",
    Female = "female",
    Andromorph = "andromorph",
    Gynomorph = "gynomorph",
    Hermaphrodite = "hermaphrodite",
    MaleHerm = "male-herm",
    Ambiguous = "ambiguous"
}

enum Relations {
    MM = "m/m",
    MF = "m/f",
    MAnd = "m/and",
    MGyn = "m/gyn",
    MHerm = "m/herm",
    MMherm = "m/mherm",
    MAmb = "m/amb",
    FF = "f/f",
    FAnd = "f/and",
    FGyn = "f/gyn",
    FHerm = "f/herm",
    FMherm = "f/mherm",
    FAmb = "f/amb",
    AndAnd = "and/and",
    AndGyn = "and/gyn",
    AndHerm = "and/herm",
    AndMherm = "and/mherm",
    AndAmb = "and/amb",
    GynGyn = "gyn/gyn",
    GynHerm = "gyn/herm",
    GynMherm = "gyn/mherm",
    GynAmb = "gyn/amb",
    HermHerm = "herm/herm",
    HermMherm = "herm/mherm",
    HermAmb = "herm/amb",
    MhermMherm = "mherm/mherm",
    MhermAmb = "mherm/amb",
    AmbAmb = "amb/amb"
}

enum SpeciesType {
    Anthro = "anthro",
    Feral = "feral",
    Humanoid = "humanoid",
    Human = "human",
    Taur = "taur"
}

enum NumberOfCharacters {
    Zero = "zero",
    Solo = "solo",
    Duo = "duo",
    Trio = "trio",
    Group = "group",
    Unset = "unset"
}

const genderToTag = (g: Gender): string => {
    if (g === Gender.Ambiguous) return "ambiguous_gender"
    if (g === Gender.MaleHerm) return "maleherm"

    return g.toString();
}

const relationsToTag = (r: Relations): string => {
    const map = new Map<Relations, string>([
        [Relations.MM, "male/male"],
        [Relations.MF, "male/female"],
        [Relations.MAnd, "andromorph/male"],
        [Relations.MGyn, "gynomorph/male"],
        [Relations.MHerm, "herm/male"],
        [Relations.MMherm, "maleherm/male"],
        [Relations.MAmb, "male/ambiguous"],
        [Relations.FF, "female/female"],
        [Relations.FAnd, "andromorph/female"],
        [Relations.FGyn, "gynomorph/female"],
        [Relations.FHerm, "herm/female"],
        [Relations.FMherm, "maleherm/female"],
        [Relations.FAmb, "female/ambiguous"],
        [Relations.AndAnd, "andromorph/andromorph"],
        [Relations.AndGyn, "andromorph/gynomorph"],
        [Relations.AndHerm, "andromorph/hermaphrodite"],
        [Relations.AndMherm, "maleherm/andromorph"],
        [Relations.AndAmb, "andromorph/ambiguous"],
        [Relations.GynGyn, "gynomorph/gynomorph"],
        [Relations.GynHerm, "gynomorph/hermaphrodite"],
        [Relations.GynMherm, "maleherm/gynomorph"],
        [Relations.GynAmb, "gynomorph/ambiguous"],
        [Relations.HermHerm, "herm/herm"],
        [Relations.HermMherm, "maleherm/herm"],
        [Relations.HermAmb, "herm/ambiguous"],
        [Relations.MhermMherm, "maleherm/maleherm"],
        [Relations.MhermAmb, "maleherm/ambiguous"],
        [Relations.AmbAmb, "ambiguous/ambiguous"]
    ]);

    return map.get(r) ?? "";
}

const speciesTypeToTag = (sT: SpeciesType): string => {
    return sT.toString()
}

const numberOfCharactersToTag = (n: NumberOfCharacters): string => {
    if (n === NumberOfCharacters.Unset) return ""
    if (n === NumberOfCharacters.Zero) return "zero_pictured"

    return n.toString()
}

const shortenNumber = (n: number): string => {
    if (n === 0) return "0";

    const lookup = [
        {value: 1e9, symbol: "B"},
        {value: 1e6, symbol: "M"},
        {value: 1e3, symbol: "K"}
    ]

    const item = lookup.find(x => Math.abs(n) >= x.value);

    if (!item) {
        return Number(n.toPrecision(3)).toString()
    }

    const scaled = n / item.value
    const formatted = Number(scaled.toPrecision(3))

    return `${formatted}${item.symbol}`
}

export class TagPreviewModal extends Modal {

    private modalBackground: HTMLElement | null = null;

    public setModalBackground(modalBackground: HTMLElement) {
        this.modalBackground = modalBackground;
    }

    public aggregateModalTags(): string[] {
        if (!this.modalBackground) throw new Error('Cannot aggregate tags without \'modalBackground\' set')
        let tags: string[] = [];

        this.modalBackground.querySelectorAll<SelectableButton>('[data-id="modal-species-types"] selectable-button[selected="true"]').forEach(button => {
            tags.push(speciesTypeToTag(button.value as SpeciesType))
        })
        this.modalBackground.querySelectorAll<ConditionalButton>('[data-id="modal-genders"] condition-button[selected="true"]').forEach(button => {
            tags.push(genderToTag(button.value as Gender))
        })
        this.modalBackground.querySelectorAll<ConditionalButton>('[data-id="modal-relations"] conditional-button[active="true"][selected="true"]').forEach(button => {
            if (button.value === "") return;
            tags.push(relationsToTag(button.value as Relations))
        })
        this.modalBackground.querySelectorAll<ExclusiveButton>('[data-id="modal-characters"] exclusive-button[group-name="modal-character-number"][selected="true"]').forEach(button => {
            tags.push(numberOfCharactersToTag(button.value as NumberOfCharacters))
        })

        tags = tags.concat(
                this.modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-characters"] textarea')!.value.split(' ')
            ).concat(
                this.modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-general"] textarea')!.value.split(' ')
            ).concat(
                this.modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-species"] textarea')!.value.split(' ')
            ).concat(
                this.modalBackground.querySelector<HTMLTextAreaElement>('[data-id="modal-creators"] textarea')!.value.split(' ')
            )

        return tags.filter(t => t.trim() !== "")
    }

    public async bulkTagInfo(tags: string[]): Promise<{category: number, post_count: number, name: string}[]> {
        let list: any[] = [];

        try {
            const query = `https://e621.net/tags.json?search[name]=${tags.join(',')}&limit=320`
            const response = await fetch(query)
            const result = await response.json()

            list = list.concat(result);
        } catch (err) {
            console.log(err)
        }

        return list;
    }

    protected getHtml(): string {
        return `
            <div data-id="secondary-modal">
                <div>
                    <h3>Tag Preview</h3>
                    <div class="tag-list"></div>
                    <div class="modal-bottom">
                        <button>Close</button>
                    </div>
                </div>
            </div>
        `
    }

    protected getCSS(): string {
        return ``
    }

    protected onRender(): void {
        this.querySelector('.modal-bottom button')!.addEventListener('click', () => {
            this.close()
        })
    }

    protected onClose(): void {

    }

    protected onOpen(): void {
        const currentTags = this.aggregateModalTags();
        if (currentTags.length === 0) {
            console.log('No tags')
            return;
        }

        const tagPreview = this.querySelector('.tag-list') as HTMLElement;

        debouncedTagPreview(currentTags, async (allTags) => {
            const tagInfo = await this.bulkTagInfo(allTags)
            tagPreview.innerHTML = ""
            tagInfo.forEach(tag => {
                tagPreview.insertAdjacentHTML('beforeend', `
                    <div class="tag-preview ${tagTypeNumberToClassName(tag.category)} ${currentTags.includes(tag.name) ? '' : 'implied'}">
                        <p class="tag-preview-name">${tag.name}</p>
                        <p class="tag-preview-count">${shortenNumber(tag.post_count)}</p>
                    </div>
                `)
            })
        }, () => {})
    }
}

customElements.define('tag-preview-modal', TagPreviewModal)