const ALPHA = 1
const NUMERIC = 2

export type SplittedName = Array<string | number>

/**
 * Split a name in chunks of lower case strings and integers.
 * For instance `proj82` will become `['proj', 82]`,
 * `My birthday is 2015 January 13` will become
 * `['my birthday is ', 2015, ' january ', 13]`, and
 * `3.14` will become `[3, '.', 14]`.
 *
 * This comes in handy if you need a more human-friendly sorting of names.
 */
export function splitName(name: string): SplittedName {
    if (name.length === 0) return []

    const result: SplittedName = []
    let pointer = 0
    let mode = isDigit(name.charAt(0)) ? NUMERIC : ALPHA
    for (let cursor = 1; cursor < name.length; cursor++) {
        const c = name.charAt(cursor)
        if (mode === NUMERIC) {
            if (isDigit(c)) continue

            result.push(parseInt(name.substring(pointer, cursor), 10))
            pointer = cursor
            mode = ALPHA
        } else {
            // mode === ALPHA
            if (!isDigit(c)) continue

            result.push(name.substring(pointer, cursor).toLocaleLowerCase())
            pointer = cursor
            mode = NUMERIC
        }
    }
    if (mode === NUMERIC) {
        result.push(parseInt(name.substr(pointer), 10))
    } else {
        result.push(name.substr(pointer).toLocaleLowerCase())
    }
    return result
}

function isDigit(char: string): boolean {
    return "0123456789".includes(char)
}

const LOWER = -1
const GREATER = +1

export function compareSplittedNames(
    name1: SplittedName,
    name2: SplittedName
): typeof LOWER | 0 | typeof GREATER {
    const len1 = name1.length
    const len2 = name2.length
    for (let i = 0; i < Math.min(len1, len2); i++) {
        const item1 = name1[i]
        const type1 = typeof item1
        const item2 = name2[i]
        const type2 = typeof item2
        if (type1 === type2) {
            if (item1 < item2) return LOWER
            if (item1 > item2) return GREATER
        } else {
            if (type1 === "number") return GREATER
            if (type2 === "number") return LOWER
        }
    }
    if (len1 < len2) return LOWER
    if (len1 > len2) return GREATER
    return 0
}

/**
 * Scientists expect to see folders sorted like this:
 * * proj1
 * * proj2
 * * proj10
 *
 * But the default string sorting will produce this:
 * * proj1
 * * proj10
 * * proj2
 */
export function humanFriendlySort(names: string[]): string[] {
    const extendedArray: Array<[string, SplittedName]> = names.map((name) => [
        name,
        splitName(name),
    ])
    return extendedArray
        .sort(([, splittedName1], [, splittedName2]) =>
            compareSplittedNames(splittedName1, splittedName2)
        )
        .map(([name]) => name)
}

/**
 * Sometime we need to sort complex objects based on a string attribute.
 * Then you can use this function:
 * ```
 * const files= [
 *   { name: "bob" }, { name: "alfred" }, { name: "charles" }
 * ]
 * const sortedFiles = humanFriendlySortByKey(
 *   files,
 *   file => file.name
 * )
 * ```
 * @param items
 * @param getKey
 * @returns
 */
export function humanFriendlySortByKey<T>(
    items: T[],
    getKey: (item: T) => string
): T[] {
    const extendedArray: Array<[T, SplittedName]> = items.map((item) => [
        item,
        splitName(getKey(item)),
    ])
    return extendedArray
        .sort(([, splittedName1], [, splittedName2]) =>
            compareSplittedNames(splittedName1, splittedName2)
        )
        .map(([item]) => item)
}
