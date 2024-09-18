import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api"
import { ModelListBaseInterface } from "@/_old_/contract/manager/models/types/model-list-base"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import { isJsonRpcQueryFailure } from "../../../contract/service/json-rpc"
import GenericEvent from "../../../tool/event"

export default abstract class ModelListBase<
    T extends { id: number; modelIds: number[] },
> implements ModelListBaseInterface<T>
{
    public readonly eventChange = new GenericEvent<ModelListBase<T>>()

    constructor(
        protected brayns: BraynsApiServiceInterface,
        protected readonly table: TableStorageInterface<T>
    ) {
        this.table.eventChange.add(() => this.eventChange.trigger(this))
    }

    useItems(): T[] {
        return this.table.useItems()
    }

    useIds(): number[] {
        return this.table.useIds()
    }

    async getItems(): Promise<T[]> {
        return await this.table.listItems()
    }

    async getIds(): Promise<number[]> {
        return await this.table.listIds()
    }

    async get(id: number): Promise<T | undefined> {
        return await this.table.get(id)
    }

    async remove(...ids: number[]): Promise<void> {
        for (const id of ids) {
            const model = await this.get(id)
            if (!model) continue

            try {
                await this.brayns.removeModel(model.modelIds)
            } catch (ex) {
                // We ignore errors when they just say that the model
                // has already been deleted. Because in this case, removing
                // it from the list is a good think to do.
                if (!isJsonRpcQueryFailure(ex) || ex.code !== -32603) {
                    console.error(`Unable to remove model with id ${id}:`, ex)
                    throw ex
                }
            }
            await this.table.remove(id)
        }
    }

    async clear(): Promise<void> {
        const ids = await this.getIds()
        for (const id of ids) {
            await this.remove(id)
        }
    }
}
