/**
 * Expand something like "55,40-43, 12" into [12,40,41,42,43,55].
 * The result will have only unique GIDs in ascending order.
 */
export function expandRange(rangeDefinition: string): number[] {
    const gids = new Set<number>()
    const ranges = rangeDefinition.split(",")
    for (const range of ranges) {
        const [minTxt, maxTxt] = range.split("-")
        const min = parseInt(minTxt, 10)
        const max = parseInt(maxTxt, 10)
        if (isNaN(max)) {
            if (!isNaN(min)) {
                gids.add(min)
            }
        } else if (!isNaN(min)) {
            for (
                let val = Math.min(min, max);
                val <= Math.max(min, max);
                val++
            ) {
                gids.add(val)
            }
        }
    }
    return Array.from(gids).sort((a, b) => a - b)
}

const RX_RANGE =
    /^\s*[0-9]+\s*(?:[-]?\s*[0-9]+\s*)?(?:,\s*[0-9]+\s*(?:[-]?\s*[0-9]+\s*)?)*$/u

export function isValidRange(range: string): boolean {
    RX_RANGE.lastIndex = -1
    return RX_RANGE.test(range)
}

/**
 * Try yo make `range` the smaller possible.
 * For instance: `range("1,2,3,5,6,9") === "1-3,5-6,9"
 * @param range
 * @returns
 */
export function optimizeRange(range: string): string {
    const gids: number[] = expandRange(range)
    if (gids.length === 0) return ""

    gids.sort((a, b) => a - b)
    const ranges: string[] = []
    let start = gids.shift() ?? 0
    let end = start
    for (const gid of gids) {
        if (gid - end > 1) {
            ranges.push(end > start ? `${start}-${end}` : `${start}`)
            start = gid
        }
        end = gid
    }
    ranges.push(end > start ? `${start}-${end}` : `${start}`)
    return ranges.join(",")
}
