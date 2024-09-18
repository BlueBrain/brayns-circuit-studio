const DEFAULT_COMPARATOR = (a: unknown, b: unknown) => a === b

/**
 * If `element` is not found in `array`, return a copy of this `array`
 * with `element` appended to the end.
 * Otherwise, update `element` into a copy of `array` and return this copy.
 *
 * @param array An array containing element of the same type.
 * @param element  An element we want to add to this array.
 * @param comparator Tell if two elements are equivalent.
 * If, for instance, all elements have a unique id, the comparator
 * will only check this id.
 * @returns An updated copy of `array`.
 */
export function updateArray<T>(
    array: T[],
    element: T,
    comparator: (a: T, b: T) => boolean = DEFAULT_COMPARATOR
): T[] {
    const index = array.findIndex((item) => comparator(item, element))
    if (index < 0) return [...array, element]
    const updatedArray = [...array]
    updatedArray[index] = element
    return updatedArray
}
