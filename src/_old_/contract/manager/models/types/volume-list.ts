import { ModelListBaseInterface, ModelOptions } from "./model-list-base"
import { ModelColor } from "./model-types"
import { VolumeModel } from "./volume-model"
import { LongTask } from "@/_old_/contract/service/json-rpc"

export abstract class VolumeListInterface extends ModelListBaseInterface<VolumeModel> {
    abstract load(
        options: ModelOptions<VolumeModel>,
        taskHandler: (task: LongTask) => void
    ): Promise<VolumeModel | null>
    abstract updateVisible(id: number, visible: boolean): Promise<boolean>
    abstract updateColor(id: number, colors: ModelColor): Promise<boolean>
    abstract updateUseCase(id: number, useCase: string): Promise<boolean>
}

export function isVolumeListInterface(
    data: unknown
): data is VolumeListInterface {
    return data instanceof VolumeListInterface
}
