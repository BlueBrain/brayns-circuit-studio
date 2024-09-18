/**
 * Slice an `array` in subarrays of maximum length of `chunkSize`.
 * If `array` is an empty array, this function will return an empty array,
 * not an array with an empty array in it.
 *
 * Example:
 * ```ts
 * sliceInChunks([1,2,3,4,5,6,7,8,9], 4) === [
 *   [1,2,3,4],
 *   [5,6,7,8],
 *   [9]
 * ]
 *
 * sliceInChunks([], 5) === []
 * ```
 */
export function sliceInChunks<T>(array: T[], chunkSize: number): T[][] {
    const output: T[][] = []
    const chunksCount = Math.ceil(array.length / chunkSize)
    for (let i = 0; i < chunksCount; i++) {
        const start = i * chunkSize
        const end = start + chunkSize
        output.push(array.slice(start, end))
    }
    return output
}
