const DEFAULT_COMPARATOR = (a: unknown, b: unknown) => a === b

/**
 * If `element` is found in `array`, return a copy of this `array`
 * without this `element`.
 *
 * @param array An array containing element of the same type.
 * @param element  An element we want to remove from this array.
 * @param comparator Tell if two elements are equivalent.
 * If, for instance, all elements have a unique id, the comparator
 * will only check this id.
 * @returns An updated copy of `array`.
 */
export function removeFromArray<T>(
    array: T[],
    element: T,
    comparator: (a: T, b: T) => boolean = DEFAULT_COMPARATOR
): T[] {
    return array.filter((item) => !comparator(item, element))
}
