/**
 * If you want to send some JSON stringified arrays over the network,
 * you want to split it in chunks of about the same size. That will help
 * you control the progress.
 *
 * This function will slice your array in subarrays that, once stringified,
 * will weight less than `stringSizeLimit`.
 */
export function sliceByStringSize<T>(
    array: T[],
    stringSizeLimit: number
): T[][] {
    const output: T[][] = []
    let start = 0
    let size = 0
    for (let i = 0; i < array.length; i++) {
        const item = array[i]
        // We add 1 for the comma separator.
        const itemSize = JSON.stringify(item).length + 1
        if (size + itemSize > stringSizeLimit) {
            if (i > start) {
                output.push(array.slice(start, i))
                start = i
                size = itemSize
            } else {
                output.push([item])
                start = i + 1
                size = 0
            }
        } else {
            size += itemSize
        }
    }
    if (start < array.length) {
        output.push(array.slice(start))
    }
    return output
}
