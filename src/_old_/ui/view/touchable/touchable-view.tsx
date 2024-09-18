import * as React from "react"
import "./touchable-view.css"

export interface TouchableViewProps<T> {
    className?: string
    children: React.ReactNode
    enabled?: boolean
    color?:
        | "screen"
        | "frame"
        | "section"
        | "primary-dark"
        | "primary"
        | "primary-light"
        | "accent-dark"
        | "accent"
        | "accent-light"
        | "error"
    /** Tooltip text */
    title?: string
    tag?: T
    onClick(tag?: T): void
}

export default function TouchableView<T>(props: TouchableViewProps<T>) {
    return (
        <button
            className={getClassNames<T>(props)}
            onClick={() => props.onClick(props.tag)}
            title={props.title}
        >
            {props.children}
        </button>
    )
}

function getClassNames<T>(props: TouchableViewProps<T>): string {
    const classNames = ["custom", "ui-view-TouchableView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (props.enabled === false) classNames.push("disabled")
    if (props.color) classNames.push(`theme-color-${props.color}`)
    else classNames.push("inherit-colors")

    return classNames.join(" ")
}
