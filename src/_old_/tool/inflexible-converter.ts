/**
 * Converters are used with persistent data to check if a previously
 * stored item is still of the expected type.
 * It gives an opportunity to migrate the item.
 *
 * The __inflexibleConverter__ does not migrate items:
 * if they are not of the expected type, it returns `undefined`.
 * It is an helper to quickly convert type guards into converters.
 */
export function inflexibleConverter<T>(
    typeGuard: (data: unknown) => data is T
): (arg: unknown) => T | undefined {
    return (arg: unknown) => (typeGuard(arg) ? arg : undefined)
}
