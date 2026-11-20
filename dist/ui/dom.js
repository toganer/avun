/** Typed access to the page. Fails loudly at start-up if the HTML and the code disagree. */
export function byId(id, type) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Missing element #${id}`);
    if (type && !(el instanceof type))
        throw new Error(`#${id} is not a ${type.name}`);
    return el;
}
export function svgById(id) {
    const el = document.getElementById(id);
    if (!(el instanceof SVGElement))
        throw new Error(`Missing SVG element #${id}`);
    return el;
}
export function button(className, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.addEventListener("click", onClick);
    return b;
}
export function setPressed(el, on) {
    el.setAttribute("aria-pressed", on ? "true" : "false");
}
/** Shows an element for a while, then hides it again. Calling again restarts the timer. */
export class Flash {
    constructor(el, ms) {
        this.el = el;
        this.ms = ms;
        el.addEventListener("click", () => this.hide());
    }
    show() {
        this.el.classList.add("on");
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => this.hide(), this.ms);
    }
    hide() {
        window.clearTimeout(this.timer);
        this.el.classList.remove("on");
    }
}
