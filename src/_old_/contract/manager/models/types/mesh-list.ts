import { MeshModel } from "./mesh-model"
import { ModelListBaseInterface, ModelOptions } from "./model-list-base"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import { ModelColor } from "./model-types"

export abstract class MeshListInterface extends ModelListBaseInterface<MeshModel> {
    abstract load(
        options: ModelOptions<MeshModel>,
        cancellableTaskHandler: (task: LongTask) => void
    ): Promise<MeshModel | null>
    abstract updateColor(id: number, colors: ModelColor): Promise<boolean>
    abstract updateVisible(id: number, visible: boolean): Promise<boolean>
}

export function isMeshListInterface(data: unknown): data is MeshListInterface {
    return data instanceof MeshListInterface
}
