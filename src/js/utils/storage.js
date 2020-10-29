export function set(name, value) {
    window.localStorage.setItem(name, JSON.stringify(value));
}

export function get(name, subst = null) {
    if (JSON.parse(window.localStorage.getItem(name))) {
        return JSON.parse(window.localStorage.getItem(name));
    } else return subst;
}

export function remove(name) {
    localStorage.removeItem(name);
}