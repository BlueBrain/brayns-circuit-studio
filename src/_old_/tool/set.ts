interface SetComparaisonResult<T> {
    common: T[]
    onlyInA: T[]
    onlyInB: T[]
}

export function compareSets<T>(
    setA: Set<T>,
    setB: Set<T>
): SetComparaisonResult<T> {
    const result: SetComparaisonResult<T> = {
        common: [],
        onlyInA: [],
        onlyInB: [],
    }
    for (const a of setA) {
        if (setB.has(a)) result.common.push(a)
        else result.onlyInA.push(a)
    }
    for (const b of setB) {
        if (!setA.has(b)) result.onlyInB.push(b)
    }
    return result
}
