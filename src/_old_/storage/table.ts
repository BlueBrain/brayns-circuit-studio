import * as React from "react"
import StorageInterface from "@/_old_/contract/storage"
import TypedStorage from "./typed"
import { areNotEqualArrays } from "@/_old_/tool/are-equal-arrays"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import { isNumberArray } from "@/_old_/tool/validator"
import { TableStorageInterface } from "@/_old_/contract/storage/table"

const KEY_FOR_IDS = "ids"

/**
 * A Table manages the storage of a list of typed objects with unique ids.
 */
export default class TableStorage<
    T extends { id: number },
> extends TableStorageInterface<T> {
    private readonly ids: TypedStorage<number[]>
    private readonly items: TypedStorage<T>
    private _length = -1

    constructor(
        storage: StorageInterface,
        tableName: string,
        typeConverter: (value: unknown) => T | undefined
    ) {
        super()
        this.ids = new TypedStorage<number[]>(
            storage,
            tableName,
            inflexibleConverter(isNumberArray)
        )
        this.items = new TypedStorage<T>(storage, tableName, typeConverter)
        // Compute the length.
        this.listIds()
            .then((ids) => {
                this._length = ids.length
                this.eventChange.trigger(this)
            })
            .catch(console.error)
    }

    useTable() {
        const [updatesCounter, setUpdatesCounter] = React.useState(0)
        React.useEffect(() => {
            const incrementUpdatesCounter = () =>
                setUpdatesCounter(updatesCounter + 1)
            this.eventChange.add(incrementUpdatesCounter)
            return () => this.eventChange.remove(incrementUpdatesCounter)
        }, [updatesCounter])
        return this
    }

    useIds() {
        const [ids, setIds] = React.useState<number[]>([])
        const handler = () => {
            this.listIds()
                .then((newIds) => {
                    if (areNotEqualArrays(ids, newIds)) setIds(newIds)
                })
                .catch(console.error)
        }
        React.useEffect(handler, [])
        React.useEffect(() => {
            this.eventChange.add(handler)
            return () => this.eventChange.remove(handler)
        }, [ids])
        return ids
    }

    useItems() {
        const [items, setItems] = React.useState<T[]>([])
        React.useEffect(() => {
            const handler = () => {
                this.listItems().then(setItems).catch(console.error)
            }
            handler()
            this.eventChange.add(handler)
            return () => this.eventChange.remove(handler)
        }, [])
        return items
    }

    get length() {
        return this._length
    }

    async listIds(): Promise<number[]> {
        const ids = await this.ids.load(KEY_FOR_IDS)
        return ids ?? []
    }

    async listItems(): Promise<T[]> {
        const ids = await this.listIds()
        // Ids of valid items.
        const cleanIds: number[] = []
        const items: T[] = []
        for (const id of ids) {
            const item = await this.get(id)
            if (item) {
                items.push(item)
                cleanIds.push(id)
            }
        }
        if (ids.length !== cleanIds.length) {
            // Some of the items were not found, so we have to
            // update the list of ids.
            await this.ids.save(KEY_FOR_IDS, cleanIds)
        }
        return items
    }

    get(id: number): Promise<T | undefined> {
        return this.items.load(`${id}`)
    }

    async store(item: T): Promise<T> {
        console.log("🚀 [table] item = ", item) // @FIXME: Remove this line written on 2023-10-04 at 14:36
        try {
            const ids = await this.listIds()
            if (item.id <= 0) {
                // We need a new id for this item.
                let maxId = 0
                for (const id of ids) {
                    maxId = Math.max(maxId, id)
                }
                item.id = maxId + 1
            }
            await this.items.save(`${item.id}`, item)
            if (!ids.includes(item.id)) {
                ids.push(item.id)
                await this.ids.save(KEY_FOR_IDS, ids)
            }
            this._length = ids.length
            this.eventChange.trigger(this)
            return item
        } catch (ex) {
            console.error("Unable to store this item:", item)
            console.error(ex)
            throw ex
        }
    }

    async remove(...ids: number[]): Promise<void> {
        const actualIds = (await this.ids.load(KEY_FOR_IDS)) ?? []
        const idsToRemove = ids.filter((id) => actualIds.includes(id))
        for (const id of idsToRemove) {
            await this.items.delete(`${id}`)
        }
        const idsToKeep = actualIds.filter((id) => !idsToRemove.includes(id))
        await this.ids.save(KEY_FOR_IDS, idsToKeep)
        this._length = idsToKeep.length
        this.eventChange.trigger(this)
    }

    async clear(): Promise<void> {
        const ids = await this.listIds()
        for (const id of ids) {
            await this.items.delete(`${id}`)
        }
        await this.ids.save(KEY_FOR_IDS, [])
        this._length = 0
        this.eventChange.trigger(this)
    }
}
