import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import { Vector3 } from "@/_old_/contract/tool/calc"
import {
    HitTestResult,
    HitTestResultNeuron,
    HitTestResultSpace,
    HitTestResultUnknown,
} from "@/_old_/contract/service/brayns-api/hit-test"
import {
    assertBoolean,
    assertNumber,
    assertObject,
    assertVector3,
    isNumber,
    isObject,
} from "@/_old_/tool/validator"

/**
 * @returns What has been hit at the given pixel position.
 * @param x 0 is left and 1 is right.
 * @param y 0 is bottom and 1 is top.
 */
export async function hitTest(
    brayns: JsonRpcServiceInterface,
    x: number,
    y: number
): Promise<HitTestResult> {
    const data = await brayns.exec("inspect", { position: [x, y] })
    assertObject(data, "inspect")
    const { hit } = data
    assertBoolean(hit, "inspect.hit")
    if (!hit) return makeSpace()

    const { position, model_id, metadata } = data
    assertVector3(position, "inspect.position")
    assertNumber(model_id, "inspect.model_id")
    if (isObject(metadata)) {
        const { neuron_id } = metadata
        if (isNumber(neuron_id)) {
            return makeNeuron(position, model_id, neuron_id)
        }
    }
    return makeUnknown(position, model_id, metadata)
}

function makeSpace(): HitTestResultSpace {
    return { type: "space" }
}

function makeUnknown(
    position: Vector3,
    modelId: number,
    metadata: unknown
): HitTestResultUnknown {
    return {
        type: "unknown",
        position,
        modelId,
        metadata,
    }
}

function makeNeuron(
    position: Vector3,
    modelId: number,
    cellId: number
): HitTestResultNeuron {
    return {
        type: "neuron",
        position,
        modelId,
        cellId,
    }
}
