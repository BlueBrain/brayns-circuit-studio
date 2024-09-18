import "./file-size-view.css"

import * as React from "react"

export interface FileSizeViewProps {
    className?: string
    /**
     * Size in bytes.
     */
    value: number
}

/**
 * Human friendly size label.
 * It displays the unit Kb, Mb, Gb and Tb with different colors.
 */
export default function FileSizeView(props: FileSizeViewProps) {
    return (
        <div className={getClassNames(props)}>
            {getHumanReadableSize(props.value)}
        </div>
    )
}

function getClassNames(props: FileSizeViewProps): string {
    const classNames = ["custom", "ui-view-FileSizeView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

const BYTES_PER_KILOBYTE = 1024
const KILOBYTES_PER_BYTE = 1 / BYTES_PER_KILOBYTE

function getHumanReadableSize(initialSize: number, unit = ""): JSX.Element {
    let size = initialSize
    if (unit.length > 0) {
        return <span className={unit.toLowerCase()}>{`${size} ${unit}`}</span>
    }

    if (size < BYTES_PER_KILOBYTE)
        return getHumanReadableSize(
            Math.floor(size * BYTES_PER_KILOBYTE) * KILOBYTES_PER_BYTE,
            "Kb"
        )
    size = Math.floor(size / BYTES_PER_KILOBYTE)
    if (size < BYTES_PER_KILOBYTE) return getHumanReadableSize(size, "Kb")
    size = Math.floor(size / BYTES_PER_KILOBYTE)
    if (size < BYTES_PER_KILOBYTE) return getHumanReadableSize(size, "Mb")
    size = Math.floor(size / BYTES_PER_KILOBYTE)
    if (size < BYTES_PER_KILOBYTE) return getHumanReadableSize(size, "Gb")
    size = Math.floor(size / BYTES_PER_KILOBYTE)
    return getHumanReadableSize(size, "Tb")
}
