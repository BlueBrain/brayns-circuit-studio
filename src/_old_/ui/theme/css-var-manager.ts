export default class CssVarManager {
    private readonly target: HTMLElement | SVGElement

    constructor(target?: HTMLElement | SVGElement) {
        this.target = target ?? window.document.body
    }

    set(name: string, value: string) {
        this.target.style.setProperty(sanitizeName(name), value)
    }

    get(name: string): string {
        return this.target.style.getPropertyValue(sanitizeName(name))
    }
}

/**
 * Ensure `name` is starting with a double dash ("--").
 */
function sanitizeName(name: string) {
    return name.startsWith("--") ? name : `--${name}`
}
