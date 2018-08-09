import {fromEvent, merge, Observable} from "rxjs/index";
import {CharactersList, ICharacterConfig} from "../characters/CharactersList";
import {Inject} from "../InjectDectorator";
import {filter, map} from 'rxjs/internal/operators';
import {ClientState} from '../client/ClientState';
import {BattleSide} from "../battle/BattleSide";

export class Toolbar {

    get buttons(): HTMLButtonElement[] {
        return Array.from(document.querySelectorAll('.select-button'));
    }

    get runButtonClick$(): Observable<Event> {
        return fromEvent(document.getElementById('run'), 'click');
    }

    get selectClick$(): Observable<MouseEvent> {
        return merge(
            ...this.buttons
                .map(element => fromEvent<MouseEvent>(element, 'click'))
        );
    }

    get unitButtons(): HTMLElement[] {
        return Array.from(document.querySelectorAll('.select-view > .unit'));
    }

    get chooseUnitClick$(): Observable<ICharacterConfig> {
        return merge(
            ...this.unitButtons
                .map(element => fromEvent<MouseEvent>(element, 'click'))
        )
            .pipe(filter(() => this.isSelectorOpen))
            .pipe(map((event: MouseEvent) => {
                const index = this.unitButtons.indexOf(<HTMLElement>event.currentTarget);

                return this.charactersList.types[index + 1];
            }))
    }

    get selectWindow(): HTMLElement {
        return document.querySelector('.select-window');
    }

    get isSelectorOpen(): boolean {
        return this.selectWindow.classList.contains('opened');
    }

    set isSelectorOpen(value: boolean) {
        if (value) {
            this.selectWindow.classList.add('opened');
        } else {
            this.selectWindow.classList.remove('opened');
        }
    }

    @Inject(ClientState) private clientState: ClientState;
    @Inject(CharactersList) private charactersList: CharactersList;

    private selectedItem: number;

    constructor(private container: HTMLElement) {

        this.container.innerHTML = `
            <button id="run" class="runButton toolbar-button" type="button">Run</button>
            <div class="select-window">
                <button id="select-1" class="toolbar-button select-button" type="button">
                    <div class="unit-img character_null"></div>
                </button>
                <button id="select-2" class="toolbar-button select-button" type="button">
                    <div class="unit-img character_null"></div>
                </button>
                <button id="select-3" class="toolbar-button select-button" type="button">
                    <div class="unit-img character_null"></div>
                </button>
                <button id="select-4" class="toolbar-button select-button" type="button">
                    <div class="unit-img character_null"></div>
                </button>
                
                <div class="select-view">
                    ${this.charactersList.types.slice(1).map(characterConfig => {
                        return `
                            <section class="unit">
                                <div class="unit-img ${characterConfig.key}"></div>
                                <div class="unit-description">
                                    <div class="unit-id">${characterConfig.id}</div>
                                </div>
                            </section>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.selectClick$.subscribe(event => {
            const itemIndex = this.buttons.indexOf(<HTMLButtonElement>event.currentTarget);

            if (itemIndex === this.selectedItem) {
                this.isSelectorOpen = false;

                this.selectedItem = null;
            } else {
                this.isSelectorOpen = true;

                this.selectedItem = itemIndex;
            }
        });

        this.chooseUnitClick$
            .subscribe((characterConfig) => {
                const {army} = this.clientState;

                army[this.selectedItem] = characterConfig.key;

                this.clientState.set({army: army});

                this.isSelectorOpen = false;
            });

        this.clientState.change$
            .subscribe(state => {
                this.buttons.forEach((button, index) => {
                    const type = state.army[index];
                    const icon = button.querySelector('.unit-img');

                    icon.className = `unit-img ${type}`;
                })
            });

    }
}