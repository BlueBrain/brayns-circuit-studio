import JSON5 from "json5"

export abstract class Storage<T> {
    constructor(
        private readonly prefix: string,
        private readonly typeGuard: (data: unknown) => data is T
    ) {}

    get(key: string, defaultValue: T): T {
        try {
            const data = this.getItem(`${this.prefix}/${key}`)
            if (data === null) return defaultValue

            const value: unknown = JSON5.parse(data)
            if (this.typeGuard(value)) return value

            console.warn(`Item "${key}" has an invalid type:`, value)
            throw Error("Invalid type!")
        } catch (ex) {
            console.error(
                `[Storage::${this.prefix}] Unable to get item "${key}":`,
                ex
            )
            this.del(key)
            return defaultValue
        }
    }

    set(key: string, val: T): void {
        this.setItem(`${this.prefix}/${key}`, JSON5.stringify(val))
    }

    del(key: string): void {
        this.removeItem(`${this.prefix}/${key}`)
    }

    protected abstract getItem(key: string): string | null
    protected abstract setItem(key: string, item: string): void
    protected abstract removeItem(key: string): void
}
