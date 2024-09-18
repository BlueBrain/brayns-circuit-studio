import { CircuitModel } from "./circuit-model"
import { ModelListBaseInterface, ModelOptions } from "./model-list-base"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import { ModelColor } from "./model-types"

export abstract class CircuitListInterface extends ModelListBaseInterface<CircuitModel> {
    abstract load(
        options: ModelOptions<CircuitModel>,
        onTaskReady: (task: LongTask) => void
    ): Promise<CircuitModel | null>
    abstract updateColor(id: number, colors: ModelColor): Promise<boolean>
    abstract updateVisible(id: number, visible: boolean): Promise<boolean>
}

export function isCircuitListInterface(
    data: unknown
): data is CircuitListInterface {
    return data instanceof CircuitListInterface
}
