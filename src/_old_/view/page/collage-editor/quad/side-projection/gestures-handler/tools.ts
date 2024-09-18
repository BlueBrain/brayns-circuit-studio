import { SlicesBezierCurveControlPoint } from "@/_old_/contract/feature/morphology-collage"

type Item<T> = [value: number, item: T]

/**
 * From a list of pairs of number and function,
 * execute the function with the lowest number.
 */
export function findItemForSmallestValue<T>(items: Item<T>[]): T {
    if (items.length === 0)
        throw Error(
            "findItemForSmallestValue() cannot be called with an empty array!"
        )

    const [first, ...rest] = items
    let [bestValue, bestItem] = first
    for (const [value, item] of rest) {
        if (value < bestValue) {
            bestValue = value
            bestItem = item
        }
    }
    return bestItem
}

export function cloneBezierSliceControlPoint(
    point: SlicesBezierCurveControlPoint
): SlicesBezierCurveControlPoint {
    return {
        center: [...point.center],
        type: point.type,
        handleLength: point.handleLength,
        orientation: [...point.orientation],
    }
}
