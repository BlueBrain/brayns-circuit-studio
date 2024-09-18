import * as React from "react"
import IconFactory from "../../factory/icon"
import "./icon-view.css"
import { IconName } from "../../factory/icon/icon-factory"

export interface IconViewProps {
    className?: string
    name: IconName
    onClick?(): void
    color?: string
}

export default function IconView(props: IconViewProps) {
    const handleClick = () => {
        if (!props.onClick) return

        props.onClick()
    }
    return (
        <span
            className={getClassNames(props)}
            tabIndex={0}
            onClick={handleClick}
            aria-label={props.name}
            style={{
                color: props.color ?? "currentcolor",
            }}
        >
            {IconFactory.make(props.name)}
        </span>
    )
}

function getClassNames(props: IconViewProps): string {
    const classNames = ["custom", "ui-view-IconView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (props.onClick) classNames.push("clickable")
    return classNames.join(" ")
}
