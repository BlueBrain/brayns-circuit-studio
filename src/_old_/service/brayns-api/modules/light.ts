import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import { bubbleError } from "@/_old_/tool/error"
import { isNumber, isObject } from "@/_old_/tool/validator"
import BraynsLightModuleInterface, {
    BraynsLightWithoutId,
    isBraynsLightAmbientWithoutId,
    isBraynsLightDirectionalWithoutId,
} from "@/_old_/contract/service/brayns-api/light"

export default class BraynsLightModule implements BraynsLightModuleInterface {
    constructor(private readonly brayns: JsonRpcServiceInterface) {}

    async add(light: BraynsLightWithoutId): Promise<number> {
        try {
            let data: unknown = null
            if (isBraynsLightAmbientWithoutId(light)) {
                data = await this.brayns.exec("add-light-ambient", {
                    color: light.color,
                    intensity: light.intensity,
                })
            } else if (isBraynsLightDirectionalWithoutId(light)) {
                data = await this.brayns.exec("add-light-directional", {
                    direction: light.direction,
                    color: light.color,
                    intensity: light.intensity,
                })
            }
            assertModel(data)
            return data.model_id
        } catch (ex) {
            bubbleError("Unable to add clipping plane!", ex)
        }
    }

    async clear(): Promise<void> {
        try {
            await this.brayns.exec("clear-lights")
        } catch (ex) {
            bubbleError("Unable to clear all lights!", ex)
        }
    }
}

function assertModel(data: unknown): asserts data is { model_id: number } {
    if (!isObject(data) || !isNumber(data.model_id)) {
        console.error("Expected to be a { model_id: number }, but got:", data)
        throw Error("not an object or missing model_id attribute!")
    }
}
