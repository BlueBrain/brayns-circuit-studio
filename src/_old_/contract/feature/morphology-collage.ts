import { isObject } from "@/_old_/tool/validator"
import { Quaternion, Vector3 } from "@/_old_/contract/tool/calc"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import {
    isArray,
    isNumber,
    isString,
    isVector3,
    isVector4,
} from "@/_old_/tool/validator"

export interface BezierSlicesContainer {
    id: number
    bezier: SlicesBezierCurve
    /**
     * Thumbnail image in DataURI format.
     */
    thumbnail: string
}

export interface Collage {
    id: number
    name: string
    slices: Slices
    bezierCurve?: SlicesBezierCurve
}

export function isCollage(data: unknown): data is Collage {
    if (!isObject(data)) return false
    const { id, name, slices, bezierCurve } = data
    if (!isNumber(id) || !isString(name)) return false
    if (!isSlices(slices)) return false
    return Boolean(!bezierCurve) || isSlicesBezierCurve(bezierCurve)
}

export interface Slices {
    width: number
    height: number
    depth: number
    positions: Array<{
        center: Vector3
        orientation: Quaternion
    }>
}

export function isSlices(data: unknown): data is Slices {
    if (!isObject(data)) return false
    const { width, height, depth, positions } = data
    if (!isNumber(width) || !isNumber(height) || !isNumber(depth)) return false
    if (!isArray(positions)) return false
    for (const pos of positions) {
        if (!isObject(pos)) return false
        const { center, orientation } = pos
        if (!isVector3(center) || !isVector4(orientation)) return false
    }
    return true
}

export interface SlicesBezierCurve {
    slicesCount: number
    /** Width of the slice in micrometers */
    width: number
    /** Height of the slice in micrometers */
    height: number
    /**
     * This number will be multiplied by the "average depth".
     * The "average depth" is the bezier curve length (passing through the centers)
     * divided by the number of slices (`slicesCount`).
     * If this number is less than 1, you will end up with a lot of gaps.
     * If the curve is a straigth line, 1 is the best choice,
     * but if its bent, you may want to increase it and add some overlap to
     * prevent from missing some areas.
     *
     * Default to 1.
     */
    depthScale: number
    pointStart: SlicesBezierCurveControlPoint
    pointEnd: SlicesBezierCurveControlPoint
}

export function isSlicesBezierCurve(data: unknown): data is SlicesBezierCurve {
    if (!isObject(data)) return false
    const { slicesCount, width, height, depthScale, _points } = data
    if (
        !isNumber(slicesCount) ||
        !isNumber(width) ||
        !isNumber(height) ||
        !isNumber(depthScale)
    )
        return false
    // @TODO: test points...
    return true
}

export interface SlicesBezierCurveControlPoint {
    center: Vector3
    orientation: Quaternion
    handleLength: number
    /**
     * Type is "start" for the first slice and "end" for the last one.
     * That's because the Z axis of a slice must face the camera in the end,
     * then for the first slice, the handle will point towards -Z.
     */
    type: "start" | "end"
}

export function ensureMorphologyCollageFeatureInterface(
    data: unknown
): MorphologyCollageFeatureInterface {
    if (data instanceof MorphologyCollageFeatureInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type MorphologyCollageFeatureInterface!")
}

export default abstract class MorphologyCollageFeatureInterface {
    /**
     * Instantiate a Bezier curve into a set of real slices.
     */
    abstract computeSlicesFromBezierCurve(bezier: SlicesBezierCurve): Slices

    abstract get table(): TableStorageInterface<Collage>
}
