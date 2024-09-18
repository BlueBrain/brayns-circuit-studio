import * as React from "react"
import Color from "../../color"
import { Vector4 } from "@/_old_/contract/tool/calc"
import "./color-chip-view.css"

export interface ColorChipViewProps {
    className?: string
    color: Vector4
}

export default function ColorChipView(props: ColorChipViewProps) {
    const color = Color.fromRGBA(...props.color)
    return (
        <div className={getClassNames(props)}>
            <div
                style={{
                    backgroundColor: color.stringify(),
                }}
            ></div>
        </div>
    )
}

function getClassNames(props: ColorChipViewProps): string {
    const classNames = ["custom", "ui-view-ColorChipView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
