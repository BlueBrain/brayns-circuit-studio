import { isNumber, isObject, isVector3 } from "@/_old_/tool/validator"
import { Vector3 } from "@/_old_/contract/tool/calc"

export type HitTestResult =
    | HitTestResultNeuron
    | HitTestResultUnknown
    | HitTestResultSpace

interface HitTestResultCommon {
    type: string
    position: Vector3
}

export interface HitTestResultSpace {
    type: "space"
}

interface HitTestResultModel extends HitTestResultCommon {
    modelId: number
}

export interface HitTestResultNeuron extends HitTestResultModel {
    type: "neuron"
    cellId: number
}

export interface HitTestResultUnknown extends HitTestResultModel {
    type: "unknown"
    metadata: unknown
}

export function isHitTestResultNeuron(
    data: unknown
): data is HitTestResultNeuron {
    if (!isObject(data)) return false
    const { type, position, modelId, cellId } = data
    if (type !== "neuron") return false
    return isVector3(position) && isNumber(modelId) && isNumber(cellId)
}
