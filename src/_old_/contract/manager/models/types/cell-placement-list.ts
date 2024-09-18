import { CellPlacementModel } from "./cell-placement-model"
import { ModelListBaseInterface, ModelOptions } from "./model-list-base"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import { ModelColor } from "./model-types"

export abstract class CellPlacementListInterface extends ModelListBaseInterface<CellPlacementModel> {
    abstract load(
        options: ModelOptions<CellPlacementModel>,
        onTaskReady: (task: LongTask) => void
    ): Promise<CellPlacementModel | null>
    abstract updateName(id: number, name: string): Promise<boolean>
    abstract updateColor(id: number, color: ModelColor): Promise<boolean>
    abstract updateVisible(id: number, visible: boolean): Promise<boolean>
}

export function isCellPlacementListInterface(
    data: unknown
): data is CellPlacementListInterface {
    return data instanceof CellPlacementListInterface
}
