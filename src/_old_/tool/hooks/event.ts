import React from "react"

export default interface EventInterface<T> {
    add(listener: (arg: T) => void): void
    remove(listener: (arg: T) => void): void
}

/**
 * @returns the value of an event as a React state.
 */
export function useEventValue<T>(event: EventInterface<T>, defaultValue: T): T {
    const [value, setValue] = React.useState(defaultValue)
    React.useEffect(() => {
        event.add(setValue)
        return () => event.remove(setValue)
    }, [event])
    return value
}

export function useEventTrigger<EventType, ValueType>(
    event: EventInterface<EventType>,
    callback: (eventValue: EventType) => ValueType,
    defaultValue: ValueType
) {
    const [value, setValue] = React.useState(defaultValue)
    React.useEffect(() => {
        const action = (eventValue: EventType) => {
            setValue(callback(eventValue))
        }
        event.add(action)
        return () => event.remove(action)
    }, [event])
    return value
}
