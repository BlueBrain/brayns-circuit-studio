import React from "react"
import GenericEvent from "./event"

export class SessionStorageVariable<Type> {
    private readonly eventChange = new GenericEvent<Type>()

    private readonly key: string

    private value: Type

    constructor(
        key: string,
        private readonly intialValue: Type,
        private readonly isType: (value: unknown) => value is Type
    ) {
        this.key = `${key}\n f9cc7bbcdb254ed6a4928ea485560092`
        this.value = this.load()
    }

    public get(): Type {
        return this.value
    }

    public set(newValue: Type) {
        this.value = newValue
        this.eventChange.trigger(newValue)
        this.save(newValue)
    }

    public use(): [value: Type, setValue: (value: Type) => void] {
        const [value, setValue] = React.useState(this.get())
        React.useEffect(() => {
            this.eventChange.add(setValue)
            return () => this.eventChange.remove(setValue)
        }, [])
        return [
            value,
            (v: Type) => {
                setValue(v)
                this.value = v
                this.save(v)
            },
        ]
    }

    private load(): Type {
        const { key, intialValue, isType } = this
        try {
            const text = sessionStorage.getItem(key)
            if (!text) return intialValue

            const data: unknown = JSON.parse(text)
            return isType(data) ? data : intialValue
        } catch (ex) {
            console.error(
                `Unable to retrieve "${key}" from SessionStorage!`,
                ex
            )
            return intialValue
        }
    }

    private save(value: Type) {
        sessionStorage.setItem(this.key, JSON.stringify(value))
    }
}
