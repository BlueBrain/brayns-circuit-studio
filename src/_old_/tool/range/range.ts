/**
 * Expand something like "55,40-43, 12" into "12,40,41,42,43,55".
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
