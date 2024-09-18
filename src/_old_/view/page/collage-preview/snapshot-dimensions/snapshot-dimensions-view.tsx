import * as React from "react"
import InputInteger from "@/_old_/ui/view/input/integer"
import "./snapshot-dimensions-view.css"

export interface SnapshotDimensionsViewProps {
    className?: string
    aspectRatio: number
    size: [width: number, height: number]
    onChange(this: void, size: [width: number, height: number]): void
}

export default function SnapshotDimensionsView(
    props: SnapshotDimensionsViewProps
) {
    const {
        aspectRatio,
        size: [width, height],
        onChange,
    } = props
    const updateWidth = (value: number) => {
        onChange([value, Math.ceil(value / aspectRatio)])
    }
    const updateHeight = (value: number) => {
        onChange([Math.ceil(value * aspectRatio), value])
    }
    return (
        <fieldset className={getClassNames(props)}>
            <legend>Snapshot Dimensions</legend>
            <InputInteger
                label="Width"
                size={0}
                min={1}
                value={width}
                onChange={updateWidth}
            />
            <InputInteger
                label="Height"
                size={0}
                min={1}
                value={height}
                onChange={updateHeight}
            />
        </fieldset>
    )
}

function getClassNames(props: SnapshotDimensionsViewProps): string {
    const classNames = [
        "custom",
        "view-page-collagePreview-SnapshotDimensionsView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
