/**
 * Throw up an error with additional information.
 *
 * ```ts
 * try {
 *   ...
 * } catch (ex) {
 *   bubbleError("Unable to add a clipping plane!", ex)
 * }
 * ```
 */
export function bubbleError(message: string, ex: unknown): never {
    if (ex instanceof Error) {
        console.error(message, ex.message, ex.cause)
        throw new Error(message, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            cause: ex.cause ?? ex.message,
        })
    }
    console.error(message, ex)
    throw new Error(message, { cause: ex })
}
