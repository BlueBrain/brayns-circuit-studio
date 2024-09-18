import * as React from "react"
import Painter, { ColorRampStep } from "./colorramp-painter"
import "./colorramp-editor-view.css"

export interface ColorRampEditorViewProps {
    className?: string
    colors: ColorRampStep[]
    onChange(this: void, colors: ColorRampStep[]): void
    onColorClick(this: void, colorIndex: number): void
}

/**
 * This view helps editing a color ramp with the mouse.
 * The user can drag existing markers or click to create new one.
 * If a marker is moved as if to collapse with a neighbor, it is removed.
 *
 * Colors can only be fully opaque or fully transparent.
 */
export default function ColorRampEditorView(props: ColorRampEditorViewProps) {
    const painter = React.useMemo(() => new Painter(props.colors), [])
    React.useEffect(() => {
        painter.colors = props.colors
    })
    return (
        <canvas
            className={getClassNames(props)}
            ref={(canvas) => {
                painter.onChange = props.onChange
                painter.onSelect = props.onColorClick
                painter.canvas = canvas
            }}
        ></canvas>
    )
}

function getClassNames(props: ColorRampEditorViewProps): string {
    const classNames = ["custom", "view-ColorrampEditorView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
