
export default function create(el, classNames, child, parent, ...dataAtrr) {
    let element = null;
    try {
        element = document.createElement(el);
    } catch (er) {
       throw new Error('Unable to create HTMLElement!');
    }

    if (classNames) {
        element.classList.add(...classNames.split(' '));
    }

    if (child && Array.isArray(child)) {
        child.forEach((childElement) => {
            childElement && element.appendChild(childElement);
        });
    } else if (child && typeof child === 'object') {
        element.appendChild(child);
    } else if (child && typeof child === 'string') {
        element.innerHTML = child;
    }

    if (parent) {
        parent.appendChild(element);
    }

    if (dataAtrr.length) {
        dataAtrr.forEach(([attrName, arrtValue]) => {
            if (arrtValue === '') {
                element.setAttribute(attrName, '');
            } else {
                if(attrName.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/)) {
                    element.setAttribute(attrName,arrtValue);
                } else {
                    element.dataset[attrName] = arrtValue;
                }
            }
        });
    }
    return element;
}
