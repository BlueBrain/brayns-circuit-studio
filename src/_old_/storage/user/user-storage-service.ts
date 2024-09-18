import BackendManagerInterface from "@/_old_/contract/manager/backend"
import JSON5 from "json5"
import PersistenceServiceInterface from "@/_old_/contract/service/storage/user-storage"
import TableStorage from "../table"
import { TableStorageInterface } from "@/_old_/contract/storage/table"

/* eslint-disable class-methods-use-this */
export default class PersistenceService extends PersistenceServiceInterface {
    public readonly type = "user"

    /**
     * As soon as the backend is ready, we will implement a connection to it here,
     * instead of the LocalStorage.
     */
    constructor(private readonly _backend: BackendManagerInterface) {
        super()
    }

    makeTable<T extends { id: number }>(
        tableName: string,
        typeConverter: (arg: unknown) => T | undefined
    ): TableStorageInterface<T> {
        return new TableStorage(this, tableName, typeConverter)
    }

    // We don't need asynchronism for LocalStorage, but other implementations
    // will need it, that's why the interface demands it.
    // eslint-disable-next-line @typescript-eslint/require-await
    async load(name: string, defaultValue?: unknown): Promise<unknown> {
        const value = window.localStorage.getItem(name)
        if (!value) return defaultValue

        try {
            const data: unknown = JSON5.parse(value)
            return data
        } catch (ex) {
            console.error(
                `Pesistent variable "${name}" has an invalid JSON5 format:`,
                value
            )
            console.error(ex)
            return defaultValue
        }
    }

    // We don't need asynchronism for LocalStorage, but other implementations
    // will need it, that's why the interface demands it.
    // eslint-disable-next-line @typescript-eslint/require-await
    async save(name: string, value: unknown): Promise<void> {
        window.localStorage.setItem(name, JSON5.stringify(value))
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async delete(name: string): Promise<void> {
        window.localStorage.removeItem(name)
    }
}
