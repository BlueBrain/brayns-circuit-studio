export default interface EventInterface<T> {
    add(listener: (arg: T) => void): void
    remove(listener: (arg: T) => void): void
}

export interface TriggerableEventInterface<T> extends EventInterface<T> {
    /**
     * Send `arg` to all listeners.
     */
    trigger(this: void, arg: T): void

    /**
     * Send `arg` to the last added listener.
     */
    triggerOnlyLastAddedListener(this: void, arg: T): void
}
