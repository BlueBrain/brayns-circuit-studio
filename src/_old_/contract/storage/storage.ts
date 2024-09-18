import { TableStorageInterface } from "./table"

export default abstract class StorageInterface<T = unknown> {
    abstract load(name: string, defaultValue?: T): Promise<T | undefined>
    abstract save(name: string, value: T): Promise<void>
    abstract delete(name: string): Promise<void>
    /**
     * A Table owns items identified by an unique numerical id.
     * @param tableName Name of this table. Must be unique in the project.
     * @param typeConverter Ensure the items in the table have the correct type.
     * If this function returns `undefined` that means that the item stored
     * is no more compatible with the expected type and it will be deleted.
     * If it returns an object different from `arg`, that means that the stored
     * item needed to be converted to the new expected type, then it will be stored
     * in this new converted type.
     */
    abstract makeTable<T extends { id: number }>(
        tableName: string,
        typeConverter: (arg: unknown) => T | undefined
    ): TableStorageInterface<T>
}

export function ensureStorageInterface(data: unknown): StorageInterface {
    if (data instanceof StorageInterface) return data

    console.error("Expected StorageInterface but got:", data)
    throw Error("Service is not of type StorageInterface!")
}
