import { ActiveDataInterface } from "@/_old_/contract/tool/active-data"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"

export default class ActiveData<T> implements ActiveDataInterface<T> {
    private _value: T

    private readonly event: TriggerableEventInterface<T>

    constructor(
        initialValue: T,
        makeEvent: () => TriggerableEventInterface<T>
    ) {
        this._value = initialValue
        this.event = makeEvent()
    }

    get value() {
        return this._value
    }

    set value(value: T) {
        if (value !== this._value) {
            this._value = value
            this.event.trigger(value)
        }
    }

    add(listener: (arg: T) => void) {
        this.event.add(listener)
    }

    remove(listener: (arg: T) => void) {
        this.event.remove(listener)
    }
}
