import { ModelListBaseInterface, ModelOptions } from "./model-list-base"
import { MorphologyModel } from "./morphology-model"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import { ModelColor } from "./model-types"

export abstract class MorphologyListInterface extends ModelListBaseInterface<MorphologyModel> {
    abstract load(
        options: ModelOptions<MorphologyModel>,
        taskHandler: (task: LongTask) => void
    ): Promise<MorphologyModel | null>
    abstract updateColor(id: number, colors: ModelColor): Promise<boolean>
    abstract updateVisible(id: number, visible: boolean): Promise<boolean>
}

export function isMorphologyListInterface(
    data: unknown
): data is MorphologyListInterface {
    return data instanceof MorphologyListInterface
}
