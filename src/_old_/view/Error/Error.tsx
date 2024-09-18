import JSON5 from "json5"
import * as React from "react"
import Styles from "./Error.module.css"

export interface ErrorProps {
    className?: string
    value: unknown
}

export default function (props: ErrorProps) {
    const { value } = props
    if (!value) return null

    let content = <pre>{JSON5.stringify(value, null, "  ")}</pre>
    if (typeof value === "string") {
        content = <pre>{value}</pre>
    } else if (value instanceof Error) {
        content = (
            <>
                <div>{value.message}</div>
                {value.stack && (
                    <details>
                        <summary>Details</summary>
                        <pre>{value.stack}</pre>
                    </details>
                )}
            </>
        )
    }
    return <div className={getClassName(props)}>{content}</div>
}

function getClassName({ className }: ErrorProps) {
    const classes = [Styles["Error"]]
    if (className) classes.push(className)
    return classes.join(" ")
}
