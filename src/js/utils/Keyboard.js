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
                const keyObj = this.keyBase.find((key) => key.code === code);
                if (keyObj) {
                    const keyButton = new Key(keyObj);
                    this.keyButtons.push(keyButton);
                    rowElement.appendChild(keyButton.div);
                }
            });
        });
    }
}