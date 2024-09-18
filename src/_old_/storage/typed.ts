import StorageInterface from "@/_old_/contract/storage"
import TableStorage from "./table"
import { TableStorageInterface } from "@/_old_/contract/storage/table"

/**
 * A typed storage adds a prefix to all the keys you use.
 * It's like a kind of namespace, protecting from name collisions.
 * Moreover, every item in this storage is ensured to have the same type T.
 */
export default class TypedStorage<T> implements StorageInterface {
    private readonly key: (name: string) => string

    constructor(
        private readonly storage: StorageInterface,
        prefix: string,
        private readonly typeConverter: (item: unknown) => T | undefined
    ) {
        this.key = (name: string) => `@${prefix}::${name}`
    }

    makeTable<T extends { id: number }>(
        tableName: string,
        typeConverter: (arg: unknown) => T | undefined
    ): TableStorageInterface<T> {
        return new TableStorage(this, tableName, typeConverter)
    }

    async load(name: string, defaultValue?: T): Promise<T | undefined> {
        const { key, typeConverter } = this
        const value = await this.storage.load(key(name), defaultValue)
        if (typeof value === "undefined") return defaultValue

        const convertedValue = typeConverter(value)
        if (convertedValue === value) return value as T

        if (typeof convertedValue === "undefined") {
            console.error(
                `Item in LocalStorage with key "${key(
                    name
                )}" has an invalid type!\nIt will be deleted.`
            )
            console.error("Here is the value we got:", value)
            await this.delete(name)
            return defaultValue
        }

        // The value is of an old type but can be converted to the expected one.
        await this.save(name, convertedValue)
        return convertedValue
    }

    save(name: string, value: T): Promise<void> {
        return this.storage.save(this.key(name), value)
    }

    delete(name: string): Promise<void> {
        return this.storage.delete(this.key(name))
    }
}
