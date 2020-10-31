import create from './create.js';

export default class Key {
    constructor({ small, shift, code }) {
        this.code = code;
        this.small = small;
        this.shift = shift;
        this.isFnKey =Boolean(small.match(/en|ru|arr|Alt|Shift|Tab|Backspace|Delete|Enter|CapsLock|Close|ss/));

        if (shift && shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
            this.sub = create('div', 'sub', this.shift);
        } else {
            this.sub = create('div', 'sub', '');
        }

        this.letter = create('div','letter', small);

        this.div = create('div', 'keyboard__key', [this.sub, this.letter], null, ['code', this.code])
    }
}