import { EulerAngles, Vector3 } from "@/_old_/contract/tool/calc"
import { inverse } from "@/_old_/constants"
import { isBoolean, isVector3 } from "@/_old_/tool/validator"

interface Size {
    width: number
    height: number
    depth: number
}

export function booleanNeedsToBeUpdated(
    newBool: boolean | undefined,
    oldBool: boolean
): newBool is boolean {
    if (!isBoolean(newBool)) return false

    return newBool !== oldBool
}

/**
 * Colors components are stored as floats between 0 and 1, but the browser can actually
 * only handle 256 levels per component. That's why this function will tell you if two
 * colors are practically different.
 */
export function colorNeedsToBeUpdated(
    newColor: unknown,
    oldColor: Vector3
): newColor is Vector3 {
    if (!isVector3(newColor)) return false
    const COLOR_COMPONENT_EPSILON = inverse(256)
    return vectorNeedsToBeUpdated(newColor, oldColor, COLOR_COMPONENT_EPSILON)
}

/**
 * Below the nanometer, we consider that there is no move.
 */
export function centerNeedsToBeUpdated(
    newCenter: Vector3 | undefined,
    oldCenter: Vector3
): newCenter is Vector3 {
    const EPSILON = 0.001
    return vectorNeedsToBeUpdated(newCenter, oldCenter, EPSILON)
}

export function orientationNeedsToBeUpdated(
    newOrientation: EulerAngles | undefined,
    oldOrientation: EulerAngles
): newOrientation is EulerAngles {
    if (!newOrientation) return false

    const EPSILON = 1e-6
    return vectorNeedsToBeUpdated(
        [newOrientation.roll, newOrientation.pitch, newOrientation.yaw],
        [oldOrientation.roll, oldOrientation.pitch, oldOrientation.yaw],
        EPSILON
    )
}

export function sizeNeedsToBeUpdated(
    newSize: Size | undefined,
    oldSize: Size
): newSize is Size {
    if (!newSize) return false

    // Below the nanometer, we consider that there is no move.
    const EPSILON = 1e-3
    return vectorNeedsToBeUpdated(
        [newSize.width, newSize.height, newSize.depth],
        [oldSize.width, oldSize.height, oldSize.depth],
        EPSILON
    )
}

/**
 * @param epsilon Two vectors are considered equals if the coordinate-wise distance between
 * them is less than `epsilon`.
 * @returns `true` only if `newVector3` is defined and it is different from `oldVector3`.
 */
export function vectorNeedsToBeUpdated<T extends number[]>(
    newVector: T | undefined,
    oldVector: T,
    epsilon: number
): newVector is T {
    if (!newVector) return false

    for (let index = 0; index < newVector.length; index++) {
        const newElement = newVector[index]
        const oldElement = oldVector[index]
        if (Math.abs(newElement - oldElement) > epsilon) return true
    }
    return false
}
