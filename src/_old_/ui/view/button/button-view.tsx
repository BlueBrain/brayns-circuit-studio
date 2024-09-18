import * as React from "react"
import IconFactory from "../../factory/icon"
import "./button-view.css"
import { IconName } from "../../factory/icon/icon-factory"

export interface ButtonViewProps<Tag> {
    className?: string
    label: string
    /**
     * If defined, an icon is added (default to the left).
     * The icon's name is used in `icon-factory`.
     */
    icon?: IconName | JSX.Element
    /**
     * Put the icon to the right of the label.
     */
    flipIcon?: boolean
    /** Flat buttons do not have any background. */
    flat?: boolean
    /** Default `false`. If `true`, use accent (secondary) color. */
    accent?: boolean
    /** Default `false`. If `true`, spread to the whole width. */
    wide?: boolean
    /** If defined, open a new tab with this URL when button is clicked. */
    href?: string
    outline?: boolean
    enabled?: boolean
    /** Default `false`. If `true`, the color is lighter.  */
    highlight?: boolean
    tag?: Tag
    onClick?(this: void, tag?: Tag): void
}

/**
 * @param props.label Text to display.
 * @param props.enabled Default `true`.
 * @param props.accent If `true` this is an accented button (with secondary color).
 * @param props.tag Any data you set as a tag will be triggered in `onClick(tag)` function.
 */
export default function ButtonView<Tag>(props: ButtonViewProps<Tag>) {
    const { label, icon, tag, onClick, href } = props
    const handleClick = () => {
        if (typeof onClick === "function") onClick(tag)
        if (typeof href === "string") window.open(href)
    }

    return (
        <button className={getClassNames(props)} onClick={handleClick}>
            {icon && (
                <div className="icon">
                    {typeof icon === "string" ? IconFactory.make(icon) : icon}
                </div>
            )}
            <div className="label">{label}</div>
        </button>
    )
}

function getClassNames<Tag>(props: ButtonViewProps<Tag>): string {
    const {
        className,
        enabled,
        accent,
        highlight,
        outline,
        wide,
        flat,
        icon,
        flipIcon,
    } = props
    const classNames = ["custom", "ui-view-ButtonView"]
    if (typeof className === "string") {
        classNames.push(className)
    }
    if (enabled === false) classNames.push("disabled")
    if (highlight === true) classNames.push("highlighted")
    if (accent === true) classNames.push("accent")
    if (wide === true) classNames.push("wide")
    if (flat === true) classNames.push("flat")
    if (outline === true) classNames.push("outline")
    if (icon) classNames.push("with-icon")
    if (flipIcon === true) classNames.push("flip")
    return classNames.join(" ")
}
