import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import { TableStorageInterface } from "@/_old_/contract/storage/table"

export default abstract class AbstractObjectManager<
    ItemType extends { id: number },
    InputType,
> {
    public readonly storage: TableStorageInterface<ItemType>

    constructor(
        protected readonly brayns: JsonRpcServiceInterface,
        session: SessionStorageServiceInterface,
        private readonly storageName: string,
        typeConverter: (data: unknown) => ItemType | undefined
    ) {
        this.storage = session.makeTable<ItemType>(storageName, typeConverter)
    }

    abstract add(...objects: InputType[]): Promise<number>

    async get(id: number): Promise<ItemType | undefined> {
        return await this.storage.get(id)
    }

    async all(): Promise<ItemType[]> {
        return await this.storage.listItems()
    }

    async remove(...ids: number[]): Promise<void> {
        try {
            // We need to check that the given ids are actual planes ids.
            const idsToRemove = (await this.storage.listIds()).filter((id) =>
                ids.includes(id)
            )
            await this.storage.remove(...idsToRemove)
            await this.brayns.exec("remove-model", { ids: idsToRemove })
        } catch (ex) {
            console.warn(
                `Error while removing ${ids.join(", ")} from "${
                    this.storageName
                }":`,
                ex
            )
        }
    }

    async clear(): Promise<void> {
        try {
            const idsToRemove = await this.storage.listIds()
            if (idsToRemove.length === 0) return

            await this.storage.remove(...idsToRemove)
            await this.brayns.exec("remove-model", { ids: idsToRemove })
        } catch (ex) {
            console.warn(`Error while deleting from "${this.storageName}":`, ex)
        }
    }
}
