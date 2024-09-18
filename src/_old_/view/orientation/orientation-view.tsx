import * as React from "react"
import InputInteger from "@/_old_/ui/view/input/integer"
import Slider from "@/_old_/ui/view/slider"
import { EulerAngles } from "@/_old_/contract/tool/calc"
import "./orientation-view.css"
import {
    DEGREES_PER_RADIAN,
    HALF_TURN_IN_DEGREES,
    QUARTER_TURN_IN_DEGREES,
    RADIANS_PER_DEGREE,
} from "@/_old_/constants"

export interface OrientationViewProps {
    className?: string
    value: EulerAngles
    onChange(this: void, value: EulerAngles): void
}

interface EulerAnglesInDegrees {
    latitude: number
    longitude: number
    tilt: number
}

/**
 * Let the user edit an orientation with Euler angles expressed in radians
 * but shown in degrees.
 */
export default function OrientationView(props: OrientationViewProps) {
    const anglesInDegrees: EulerAnglesInDegrees = eulerAnglesToDegrees(
        props.value
    )
    const update = (value: Partial<EulerAnglesInDegrees>) => {
        const updatedAngles = {
            ...anglesInDegrees,
            ...value,
        }
        props.onChange(eulerAnglesToRadians(updatedAngles))
    }
    return (
        <div className={getClassNames(props)}>
            {renderNumbers(anglesInDegrees, update)}
            {renderSliders(anglesInDegrees, update)}
        </div>
    )
}

function renderSliders(
    anglesInDegrees: EulerAnglesInDegrees,
    update: (value: Partial<EulerAnglesInDegrees>) => void
) {
    return (
        <div className="sliders">
            <div>X</div>
            <Slider
                wide={true}
                steps={1}
                value={anglesInDegrees.latitude}
                min={-HALF_TURN_IN_DEGREES}
                max={HALF_TURN_IN_DEGREES}
                onChange={(latitude) => update({ latitude })}
            />
            <div>Y</div>
            <Slider
                wide={true}
                steps={1}
                value={anglesInDegrees.longitude}
                min={-HALF_TURN_IN_DEGREES}
                max={HALF_TURN_IN_DEGREES}
                onChange={(longitude) => update({ longitude })}
            />
            <div>Z</div>
            <Slider
                wide={true}
                steps={1}
                value={anglesInDegrees.tilt}
                min={-HALF_TURN_IN_DEGREES}
                max={HALF_TURN_IN_DEGREES}
                onChange={(tilt) => update({ tilt })}
            />
        </div>
    )
}

function renderNumbers(
    anglesInDegrees: EulerAnglesInDegrees,
    update: (value: Partial<EulerAnglesInDegrees>) => void
) {
    return (
        <div className="numbers">
            <InputInteger
                label="Lat./Pitch (X)"
                value={anglesInDegrees.latitude}
                min={-QUARTER_TURN_IN_DEGREES}
                max={QUARTER_TURN_IN_DEGREES}
                onChange={(latitude) => update({ latitude })}
            />
            <InputInteger
                label="Lon./Yaw (Y)"
                value={anglesInDegrees.longitude}
                min={-HALF_TURN_IN_DEGREES}
                max={HALF_TURN_IN_DEGREES}
                onChange={(longitude) => update({ longitude })}
            />
            <InputInteger
                label="Tilt/Roll (Z)"
                value={anglesInDegrees.tilt}
                min={-HALF_TURN_IN_DEGREES}
                max={HALF_TURN_IN_DEGREES}
                onChange={(tilt) => update({ tilt })}
            />
        </div>
    )
}

function getClassNames(props: OrientationViewProps): string {
    const classNames = ["custom", "view-OrientationView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function eulerAnglesToDegrees(angles: EulerAngles): EulerAnglesInDegrees {
    const { roll, pitch, yaw } = angles
    return {
        latitude: roll * DEGREES_PER_RADIAN,
        longitude: pitch * DEGREES_PER_RADIAN,
        tilt: yaw * DEGREES_PER_RADIAN,
    }
}

function eulerAnglesToRadians(angles: EulerAnglesInDegrees): EulerAngles {
    const { latitude, longitude, tilt } = angles
    return {
        roll: latitude * RADIANS_PER_DEGREE,
        pitch: longitude * RADIANS_PER_DEGREE,
        yaw: tilt * RADIANS_PER_DEGREE,
    }
}
