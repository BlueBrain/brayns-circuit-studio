class KeyboardWatcher {
    private readonly keys = new Set<string>()

    constructor() {
        document.addEventListener(
            "keydown",
            (evt) => this.keys.add(evt.key),
            true
        )
        document.addEventListener(
            "keyup",
            (evt) => this.keys.delete(evt.key),
            true
        )
    }

    isPressed(key: string): boolean {
        return this.keys.has(key)
    }
}

let instance: KeyboardWatcher | null = null

/**
 * Check if a key is currently pressed.
 */
export function IsKeyPressed(key: string): boolean {
    if (!instance) instance = new KeyboardWatcher()
    return instance.isPressed(key)
}
