import { GenericEvent } from "@tolokoban/ui"

export class ActiveValue<T> {
    public readonly event = new GenericEvent<T>()

    private _value: T

    constructor(value: T) {
        this._value = value
    }

    get value() {
        return this._value
    }
    set value(value: T) {
        if (this._value === value) return

        this._value = value
        this.event.dispatch(value)
    }
}
