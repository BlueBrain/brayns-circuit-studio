import * as React from "react"
import InputFloat from "@/_old_/ui/view/input/float"
import "./location-view.css"
import { Vector3 } from "@/_old_/contract/tool/calc"

interface Location {
    x: number
    y: number
    z: number
}

export interface LocationViewProps {
    className?: string
    value: Vector3
    /** If defined, limit the display to this number of decimal digits. */
    truncate?: number
    onChange(this: void, location: Vector3): void
}

const X = 0
const Y = 1
const Z = 2

export default function LocationView(props: LocationViewProps) {
    const location = props.value
    const update = (part: Partial<Location>) => {
        const [x, y, z] = location
        const center = { x, y, z, ...part }
        props.onChange([center.x, center.y, center.z])
    }
    return (
        <div className={getClassNames(props)}>
            <InputFloat
                label="Center (X)"
                className="column"
                value={location[X]}
                truncate={props.truncate}
                onChange={(x) => update({ x })}
            />
            <InputFloat
                label="Center (Y)"
                className="column"
                value={location[Y]}
                truncate={props.truncate}
                onChange={(y) => update({ y })}
            />
            <InputFloat
                label="Center (Z)"
                className="column"
                value={location[Z]}
                truncate={props.truncate}
                onChange={(z) => update({ z })}
            />
        </div>
    )
}

function getClassNames(props: LocationViewProps): string {
    const classNames = ["custom", "view-LocationView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
