import * as React from "react"
import TextInput from "../text"
import { isNumber } from "@/_old_/tool/validator"
import "./float-view.css"

export interface FloatViewProps {
    className?: string
    value: number
    min?: number
    max?: number
    label?: string
    size?: number
    enabled?: boolean
    wide?: boolean
    /** If defined it is the maximum number of decimal digits to show. Can be negative. */
    truncate?: number
    onChange?(this: void, value: number): void
    onEnterPressed?(this: void, value: number): void
}

const RX_FLOAT = /^[+-]?(?:[.][0-9]+|[0-9]+(?:[.][0-9]+)?)(?:e[+-]?[0-9]+)?$/giu

export default function FloatView(props: FloatViewProps) {
    const { value, label, size, enabled, wide, onChange, onEnterPressed } =
        props
    const validator = (valueToValidate: string) => {
        RX_FLOAT.lastIndex = -1
        if (!RX_FLOAT.test(valueToValidate)) return false
        const numericValue = parseFloat(valueToValidate)
        if (typeof props.min === "number" && numericValue < props.min)
            return false
        if (typeof props.max === "number" && numericValue > props.max)
            return false
        return true
    }
    return (
        <React.StrictMode>
            <TextInput
                className={getClassNames(props)}
                value={truncateIfNeeded(value, props.truncate)}
                label={label}
                size={size}
                enabled={enabled}
                wide={wide}
                validator={validator}
                onChange={(text: string) =>
                    onChange && onChange(parseFloat(text))
                }
                onEnterPressed={(text: string) =>
                    onEnterPressed && onEnterPressed(parseFloat(text))
                }
            />
        </React.StrictMode>
    )
}

function getClassNames(props: FloatViewProps): string {
    const classNames = ["custom", "ui-view-input-FloatView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

/**
 * ```
 * truncateIfNeeded(3.14) === "3.14"
 * truncateIfNeeded(3.14, 1) === "3.1"
 * truncateIfNeeded(3.14, 5) === "3.14"
 * truncateIfNeeded(2481.485, -2) === "2400"
 * ```
 */
function truncateIfNeeded(value: number, truncate: number | undefined): string {
    if (isNumber(truncate)) {
        if (truncate < 1) {
            const pow = Math.pow(10, -truncate)
            return (pow * Math.round(value / pow)).toFixed(0)
        }
        const [integral, decimal] = `${value}`.split(".")
        if (!decimal || decimal.length <= truncate) return `${value}`
        return `${integral}.${decimal.substring(0, truncate)}`
    }
    return `${value}`
}
