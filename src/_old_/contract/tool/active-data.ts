/**
 * Call every listener everytime the value is updated.
 */
export interface ActiveDataInterface<T> {
    value: T
    add(listener: (value: T) => void): void
    remove(listener: (value: T) => void): void
}

export interface ReadonlyActiveDataInterface<T> {
    readonly value: T
    add(listener: (value: T) => void): void
    remove(listener: (value: T) => void): void
}
