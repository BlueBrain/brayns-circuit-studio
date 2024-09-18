export default interface Progress {
    /** Percentage of progress between 0 and 1. */
    value?: number
    /** Optional label of the current step. */
    label?: string
}

export type ProgressHandler = (this: void, progress: Progress) => void
