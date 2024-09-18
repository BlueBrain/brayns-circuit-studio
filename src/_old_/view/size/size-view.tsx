import * as React from "react"
import InputFloat from "@/_old_/ui/view/input/float"
import "./size-view.css"

interface Size {
    width: number
    height: number
    depth: number
}

export interface SizeViewProps {
    className?: string
    value: Size
    /** If defined it's the number of decimal digits to show. */
    truncate?: number
    onChange(this: void, size: Size): void
}

export default function SizeView(props: SizeViewProps) {
    const size = props.value
    const update = (part: Partial<Size>) => {
        props.onChange({
            ...props.value,
            ...part,
        })
    }
    return (
        <div className={getClassNames(props)}>
            <InputFloat
                label="Width"
                className="column"
                value={size.width}
                truncate={props.truncate}
                onChange={(width) => update({ width })}
            />
            <InputFloat
                label="Height"
                className="column"
                value={size.height}
                truncate={props.truncate}
                onChange={(height) => update({ height })}
            />
            <InputFloat
                label="Depth"
                className="column"
                value={size.depth}
                truncate={props.truncate}
                onChange={(depth) => update({ depth })}
            />
        </div>
    )
}

function getClassNames(props: SizeViewProps): string {
    const classNames = ["custom", "view-SizeView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
