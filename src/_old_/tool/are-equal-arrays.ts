export function areEqualArrays(arr1: unknown[], arr2: unknown[]): boolean {
    const len1 = arr1.length
    const len2 = arr2.length
    if (len1 !== len2) return false

    for (let i = 0; i < len1; i++) {
        if (arr1[i] !== arr2[i]) return false
    }
    return true
}

export function areNotEqualArrays(arr1: unknown[], arr2: unknown[]): boolean {
    return !areEqualArrays(arr1, arr2)
}
