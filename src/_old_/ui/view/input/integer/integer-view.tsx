import "./integer-view.css"

import * as React from "react"

import TextInput from "../text"

export interface FloatViewProps {
    className?: string
    value: number
    label?: string
    size?: number
    enabled?: boolean
    wide?: boolean
    min?: number
    max?: number
    onChange?(this: void, value: number): void
    onEnterPressed?(this: void, value: number): void
}

const RX_INTEGER = /^[+-]?[0-9]+$/giu

export default function FloatView(props: FloatViewProps) {
    const { value, label, size, enabled, wide, onChange, onEnterPressed } =
        props
    const validator = (valueToValidate: string) => {
        RX_INTEGER.lastIndex = -1
        if (!RX_INTEGER.test(valueToValidate)) return false
        const numericValue = parseFloat(valueToValidate)
        if (typeof props.min === "number" && numericValue < props.min)
            return false
        if (typeof props.max === "number" && numericValue > props.max)
            return false
        return true
    }
    return (
        <TextInput
            className={getClassNames(props)}
            value={`${value}`}
            label={label}
            size={size}
            enabled={enabled}
            wide={wide}
            validator={validator}
            onChange={(v: string) => onChange && onChange(parseFloat(v))}
            onEnterPressed={(v: string) =>
                onEnterPressed && onEnterPressed(parseFloat(v))
            }
        />
    )
}

function getClassNames(props: FloatViewProps): string {
    const classNames = ["custom", "ui-view-input-IntegerView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
