/**
 * @see https://material.io/components/buttons-floating-action-button#usage
 */
import * as React from "react"
import IconFactory from "../../factory/icon"
import "./floating-button-view.css"

type FloatingButtonTheme = "dark" | "default" | "light"

export interface FloatingButtonViewProps<Tag> {
    className?: string
    icon: string
    /** Tooltip */
    title?: string
    small?: boolean
    accent?: boolean
    enabled?: boolean
    theme?: FloatingButtonTheme
    tag?: Tag
    onClick?(this: void, tag?: Tag): void
}

export default function FloatingButtonView<Tag>(
    props: FloatingButtonViewProps<Tag>
) {
    const handleClick = () => {
        const { onClick, tag } = props
        if (!onClick) return

        onClick(tag)
    }
    return (
        <button
            className={getClassNames<Tag>(props)}
            onClick={handleClick}
            title={props.title}
        >
            {IconFactory.make(props.icon)}
        </button>
    )
}

function getClassNames<Tag>(props: FloatingButtonViewProps<Tag>): string {
    const { className, small, enabled, accent, theme } = props
    const classNames = ["custom", "ui-view-FloatingButtonView"]
    if (typeof className === "string") {
        classNames.push(className)
    }
    if (small === true) classNames.push("small")
    if (enabled === false) classNames.push("disabled")
    classNames.push(getColorClassName(accent ?? false, theme ?? "default"))
    return classNames.join(" ")
}

function getColorClassName(
    accent: boolean,
    theme: FloatingButtonTheme
): string {
    let suffix = ""
    if (theme === "dark") suffix = "-dark"
    else if (theme === "light") suffix = "-light"
    return `theme-color-${accent ? "accent" : "primary"}${suffix}`
}
