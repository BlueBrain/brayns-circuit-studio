import {
    isBoolean,
    isNumber,
    isObject,
    isVector3,
} from "@/_old_/tool/validator"
import { Vector3 } from "@/_old_/contract/tool/calc"

export type BraynsLight = BraynsLightAmbient | BraynsLightDirectional

export type BraynsLightWithoutId =
    | Omit<BraynsLightAmbient, "id">
    | Omit<BraynsLightDirectional, "id">

interface BraynsLightCommon {
    type: string
    id: number
    color: Vector3
    intensity: number
    visible: boolean
}

export interface BraynsLightAmbient extends BraynsLightCommon {
    type: "ambient"
}

export interface BraynsLightDirectional extends BraynsLightCommon {
    type: "directional"
    direction: Vector3
}

export default interface BraynsLightModuleInterface {
    add(light: BraynsLightWithoutId): Promise<number>

    clear(): Promise<void>
}

export function isBraynsLightAmbient(
    data: unknown
): data is BraynsLightAmbient {
    return isLight(data) && data.type === "ambient"
}

export function isBraynsLightDirectional(
    data: unknown
): data is BraynsLightDirectional {
    return isLight(data) && data.type === "directional"
}

export function isBraynsLightAmbientWithoutId(
    data: unknown
): data is Omit<BraynsLightAmbient, "id"> {
    return isLightWithoutId(data) && data.type === "ambient"
}

export function isBraynsLightDirectionalWithoutId(
    data: unknown
): data is Omit<BraynsLightDirectional, "id"> {
    return isLightWithoutId(data) && data.type === "directional"
}

function isLight(data: unknown): data is BraynsLightCommon {
    if (!isLightWithoutId(data)) return false
    return isNumber((data as Record<string, unknown>).id)
}

function isLightWithoutId(
    data: unknown
): data is Omit<BraynsLightCommon, "id"> {
    if (!isObject(data)) return false
    const { visible, intensity, color } = data
    return isBoolean(visible) && isNumber(intensity) && isVector3(color)
}
