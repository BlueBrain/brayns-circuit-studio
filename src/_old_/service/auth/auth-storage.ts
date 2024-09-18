import JSON5 from "json5"
import StorageInterface from "@/_old_/contract/storage"
import { isNumber, isString } from "@/_old_/tool/validator"
import { TableStorageInterface } from "@/_old_/contract/storage/table"

export default class AuthStorage
    implements StorageInterface<string | number | null>
{
    makeTable<T extends { id: number }>(
        _tableName: string,
        _typeConverter: (arg: unknown) => T | undefined
    ): TableStorageInterface<T> {
        throw new Error("No table can be created from the AuthStorage!")
    }

    async load(
        name: string,
        defaultValue?: string | number | null
    ): Promise<string | number | null | undefined> {
        return new Promise((resolve) => {
            const value = localStorage.getItem(name)
            if (value === null) {
                resolve(defaultValue ?? null)
                return
            }

            try {
                const data: unknown = JSON5.parse(value)
                resolve(
                    data === null || isString(data) || isNumber(data)
                        ? data
                        : defaultValue ?? null
                )
            } catch (ex) {
                console.error("Invalid JSON syntax for AuthStorage:", value)
                resolve(defaultValue ?? null)
            }
        })
    }

    async save(name: string, value: string | number): Promise<void> {
        return new Promise((resolve) => {
            localStorage.setItem(name, JSON5.stringify(value))
            resolve()
        })
    }

    async delete(name: string): Promise<void> {
        return new Promise((resolve) => {
            localStorage.removeItem(name)
            resolve()
        })
    }
}
