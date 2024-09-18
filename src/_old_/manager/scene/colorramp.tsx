import SceneColorrampInterface, {
    ColorrampDefinition,
} from "@/_old_/contract/manager/scene/scene-colorramp"
import JsonRpcServiceInterface from "../../contract/service/json-rpc"
import { assertType } from "../../tool/validator"

export default class SceneColorramp implements SceneColorrampInterface {
    constructor(private readonly brayns: JsonRpcServiceInterface) {}

    async get(modelId: number): Promise<ColorrampDefinition> {
        const data = await this.brayns.exec("get-color-ramp", { id: modelId })
        assertColorrampDefinition(data)
        return data
    }

    async set(modelId: number, colorramp: ColorrampDefinition): Promise<void> {
        await this.brayns.exec("set-color-ramp", {
            id: modelId,
            color_ramp: colorramp,
        })
    }
}

function assertColorrampDefinition(
    data: unknown
): asserts data is ColorrampDefinition {
    assertType(data, {
        range: ["array", "number"],
        colors: ["array", ["array", "number"]],
    })
}
