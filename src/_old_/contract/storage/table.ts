import GenericEvent from "@/_old_/tool/event"
import { assertType } from "../../tool/validator"

/**
 * A Storage only saved key/values pairs of any type.
 * With this layer you can store arrays of typed objects
 * and get them by their unique id.
 */
export abstract class TableStorageInterface<T extends { id: number }> {
    readonly eventChange = new GenericEvent<TableStorageInterface<T>>()

    /**
     * @returns The number of items in this table. Until the table is
     * initialized, the length will be -1.
     */
    abstract get length(): number

    abstract useTable(): TableStorageInterface<T>

    abstract useIds(): number[]

    abstract useItems(): T[]

    /**
     * @returns An array of the ids of all stored items.
     */
    abstract listIds(): Promise<number[]>

    /**
     * @returns An array of all the stored items.
     */
    abstract listItems(): Promise<T[]>

    /**
     * @returns An item with the given `id`, or `undefined`.
     */
    abstract get(id: number): Promise<T | undefined>

    /**
     * Any item with an `id` equal to zero (or less) will
     * be asign a unique `id`.
     * @returns The item with its actual `id`.
     */
    abstract store(item: T): Promise<T>

    /**
     * Remove all the items of given ids.
     */
    abstract remove(...ids: number[]): Promise<void>

    /**
     * Remove every item from the table.
     */
    abstract clear(): Promise<void>
}

export function ensureTableStorageInterface<T extends { id: number }>(
    data: unknown
): TableStorageInterface<T> {
    assertType(
        data,
        {
            length: "number",
            useTable: "function",
            useIds: "function",
            useItems: "function",
            listIds: "function",
            listItems: "function",
            get: "function",
            store: "function",
            remove: "function",
            clear: "function",
        },
        "TableStorageInterfaceInterface"
    )
    return data as TableStorageInterface<T>
}
