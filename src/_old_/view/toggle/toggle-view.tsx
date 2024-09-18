import Icon from "@/_old_/ui/view/icon"
import Touchable from "@/_old_/ui/view/touchable"
import React from "react"
import Style from "./toggle-view.module.css"

export interface ToggleViewProps {
    className?: string
    label: string
    value: boolean
    onChange(this: void, value: boolean): void
}

export default function ToggleView({
    className,
    value,
    onChange,
    label,
}: ToggleViewProps) {
    return (
        <Touchable
            className={`${Style.toggle} ${value ? Style.on : Style.off} ${
                className ?? ""
            }`}
            onClick={() => onChange(!value)}
        >
            <div>{label}</div>
            <Icon name={value ? "select" : "deselect"} />
        </Touchable>
    )
}
