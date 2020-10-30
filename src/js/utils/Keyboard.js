import * as storage from './storage.js';
import create from './create.js';
import language from '../layouts/index.js'; // { en, ru }
import Key from './Key.js';

const img = create('img', '');
img.src = '../../src/images/keyboard1.png';
const header = create('div', 'header',
    [create('h1', 'title', 'Virtual Keyboard'), img]);
const main = create('main', '', header);


export default class Keyboard {
    constructor(rowsOrder) {
        this.rowsOrder = rowsOrder;
        this.keysPressed = {};
        this.isCaps = false;
    }

    init(langCode) {
        this.keyBase = language[langCode];
        this.output = create('textarea', 'output', null, main,
            ['placeholder', 'Type and enjoy :)'],
            ['rows', 5],
            ['cols', 50],
            ['spellcheck', false],
            ['autocorrect', 'off']);
        this.container = create('div', 'keyboard', null, main, ['language', langCode]);
        document.body.prepend(main);
        return this;
    }

    generateLayout() {
        this.keyButtons = [];
        this.rowsOrder.forEach((row, i) => {
            const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]);
            rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
            row.forEach((code) => {
                const keyObject = this.keyBase.find((key) => key.code === code);
                if (keyObject) {
                    const keyButton = new Key(keyObject);
                    this.keyButtons.push(keyButton);
                    rowElement.appendChild(keyButton.div);
                }
            });
        });

        document.addEventListener('keydown', this.handleEvent);
        document.addEventListener('keyup', this.handleEvent);
        this.container.addEventListener('mousedown', this.preHandleEvent);
        this.container.addEventListener('mouseup', this.preHandleEvent);
    }

    preHandleEvent = (e) => {
        e.stopPropagation();
        const keyDiv = e.target.closest('.keyboard__key');
        if (!keyDiv) return;
        const { dataset: { code } } = keyDiv;
        // const code = keyDiv.dataset.code;
        keyDiv.addEventListener('mouseleave', this.resetButton);
        this.handleEvent({code, type: e.type});
    }

    resetButton = ( { target: { dataset: { code } } }) => {
        const keyObject = this.keyButtons.find(key => key.code === code);
        console.log(keyObject);
        if (!keyObject.code.match(/Caps|Shift/)) {
            keyObject.div.classList.remove('active');
            keyObject.div.removeEventListener('mouseleave', this.resetButton);
        }
    }

    handleEvent = (e) => {
        if(e.stopPropagation) e.stopPropagation();
        const { code, type } = e;
        const keyObject = this.keyButtons.find(key => key.code === code);
        if (!keyObject) return;
        this.output.focus();

        if (type.match(/keydown|mousedown/)) {
            if(type.match(/key/)) e.preventDefault();

            if (code.match(/Shift/)) {
                if (this.shiftKey) {
                    this.shiftKey = false;
                    keyObject.div.classList.remove('active');
                    this.switchUpperCase(false);
                } else {
                    this.shiftKey = true;
                    keyObject.div.classList.add('active');
                    this.switchUpperCase(true);
                }
            }

            if (!code.match(/Caps|Shift/)) keyObject.div.classList.add('active');

            if (code.match(/Caps/) && !this.isCaps) {
                this.isCaps = true;
                this.switchUpperCase(true);
                keyObject.div.classList.add('active');
            } else if (code.match(/Caps/) && this.isCaps) {
                this.isCaps = false;
                this.switchUpperCase(false);
                keyObject.div.classList.remove('active');

            }

            if(code.match(/Control/)) {
                this.switchLanguage();
            }

            if (!this.isCaps) {
                this.printInArea(keyObject, this.shiftKey ? keyObject.shift : keyObject.small);

            } else if (this.isCaps) {
                if (this.shiftKey) {
                    this.printInArea(keyObject, keyObject.sub.innerHTML ? keyObject.shift : keyObject.small);
                 } else {
                    this.printInArea(keyObject, !keyObject.sub.innerHTML ? keyObject.shift : keyObject.small);
                }
            }


        } else if (type.match(/keyup|mouseup/)) {
                if (!code.match(/Caps|Shift/)) keyObject.div.classList.remove('active');
        }
    }

    switchLanguage = () => {
        const langAttr = Object.keys(language);
        let langIndex = langAttr.indexOf(this.container.dataset.language);
        this.keyBase = langIndex + 1 < langAttr.length ? language[langAttr[langIndex += 1]]
            : language[langAttr[langIndex -= langIndex]];

        this.container.dataset.language = langAttr[langIndex];

        storage.set('kbLang', langAttr[langIndex]);

        this.keyButtons.forEach(button => {
            const keyBtn = this.keyBase.find(key => key.code === button.code);
            if(!keyBtn) return;
            button.shift = keyBtn.shift;
            button.small = keyBtn.small;

            if(keyBtn.shift && keyBtn.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
                button.sub.innerHTML = keyBtn.shift;
            } else {
                button.sub.innerHTML = '';
            }
            button.letter.innerHTML = keyBtn.small;
        })
        if (this.isCaps) this.switchUpperCase(true);
        if (this.shiftKey) this.switchUpperCase(true);

    }

    switchUpperCase(isTrue) {
        if(isTrue) {
            this.keyButtons.forEach(button => {
                if (button.sub) {
                    if (this.shiftKey) {
                        button.sub.classList.add('sub-active');
                        button.letter.classList.add('sub-inactive');
                    }
                }
                if(!button.isFnKey && this.isCaps && !this.shiftKey && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.shift;
                } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
                    button.letter.innerHTML = button.small;
                } else if (!button.isFnKey && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.shift;
                }
            });
        } else {
            this.keyButtons.forEach(button => {
                if(button.sub.innerHTML && !button.isFnKey && !this.shiftKey) {
                    button.sub.classList.remove('sub-active');
                    button.letter.classList.remove('sub-inactive');

                    if (!this.isCaps && !this.shiftKey) {
                        button.letter.innerHTML = button.small;
                    } else if (this.isCaps || this.shiftKey) {
                        button.letter.innerHTML = button.shift;
                    }
                } else if (!button.isFnKey) {
                    if (this.isCaps || this.shiftKey) {
                        button.letter.innerHTML = button.shift;
                    } else  button.letter.innerHTML = button.small;

                }
            })
        }
    }

    printInArea(keyObj, symbol) {
        let cursorPos = this.output.selectionStart;
        const left = this.output.value.slice(0, cursorPos);
        const right = this.output.value.slice(cursorPos);

        const fnBtnHandler = {
            Tab: () => {
                this.output.value = `${left}\t${right}`;
                cursorPos += 1;
            },
            ArrowLeft: () => {
                cursorPos = cursorPos - 1 >= 0 ? cursorPos -1: 0;
            },
            ArrowRight: () => {
                cursorPos = cursorPos + 1 <= this.output.value.length ? cursorPos + 1: this.output.value.length;
            },
            Enter: () => {
                this.output.value = `${left}\n${right}`;
                cursorPos += 1;
            },
            Delete: () => {
                this.output.value =`${left}${right.slice(1)}`;
            },
            Backspace: () => {
                this.output.value =`${left.slice(0, -1)}${right}`;
                cursorPos -= 1;
            },
            Space: () => {
                this.output.value = `${left} ${right}`;
                cursorPos += 1;
            }
        }

        if (fnBtnHandler[keyObj.code]) fnBtnHandler[keyObj.code]();

        else if (!keyObj.isFnKey) {
            cursorPos += 1;
            this.output.value = `${left}${symbol || ''}${right}`;
        }
        this.output.setSelectionRange(cursorPos, cursorPos);
    }
}