import * as React from "react"
import Slider from "@/_old_/ui/view/slider"
import "./color-picker-view.css"
import {
    double,
    FULL_TURN_IN_RADIANS,
    HALF,
    half,
    HUNDRED,
    PERCENT,
} from "@/_old_/constants"
import Label from "@/_old_/ui/view/label"
import Color from "@/_old_/ui/color"
import { usePanGesture } from "@/_old_/ui/hooks"
import { PositionEvent } from "@/_old_/ui/hooks/pan-gesture"
import InputInteger from "@/_old_/ui/view/input/integer"

export interface ColorPickerViewProps {
    className?: string
    /** Hue between 0 and 1 */
    hue: number
    /** Saturation between 0 and 1 */
    sat: number
    /** Luminance between 0 and 1 */
    lum: number
    /** Opacity between 0 and 1 */
    alpha?: number
    onChange(
        this: void,
        hue: number,
        sat: number,
        lum: number,
        alpha: number
    ): void
}

const RADIUS = 50

export default function ColorPickerView(props: ColorPickerViewProps) {
    const [hue, sat, lum, alpha, setHue, setSat, setLum, setAlpha] =
        useColorComponents(props)
    const { cursorX, cursorY } = useCursorCoordinates(hue, sat)
    const handleWheelClick = (evt: PositionEvent) => {
        const x = double(evt.relX - HALF)
        const y = double(evt.relY - HALF)
        const r = Math.min(1, Math.sqrt(x * x + y * y))
        // angle is between 0 and 2π.
        const angle = Math.PI + Math.atan2(x, -y)
        const newSat = r
        setSat(newSat)
        const newHue = angle / FULL_TURN_IN_RADIANS
        setHue(newHue)
        props.onChange(newHue, newSat, lum, alpha)
        if (lum < 0.01) setLum(0.2)
    }
    const refColorWheel = usePanGesture<HTMLDivElement>({
        onStart: handleWheelClick,
        onPan: handleWheelClick,
        onEnd: handleWheelClick,
    })
    return (
        <div className={getClassNames(props)}>
            {renderLumSlider(hue, sat, lum, alpha, props.onChange, setLum)}
            <div className="wheel" ref={refColorWheel}>
                <div
                    className="cursor"
                    style={{
                        left: `${cursorX}%`,
                        top: `${cursorY}%`,
                        background: `${getColorCodeFromHSL(hue, sat, lum)}`,
                    }}
                ></div>
            </div>
            {renderHueSlider(hue, sat, lum, alpha, props.onChange, setHue)}
            {renderSatSlider(hue, sat, lum, alpha, props.onChange, setSat)}
            {typeof props.alpha === "number" &&
                renderAlphaSlider(
                    hue,
                    sat,
                    lum,
                    alpha,
                    props.onChange,
                    setAlpha
                )}
        </div>
    )
}

function useCursorCoordinates(hue: number, sat: number) {
    const angle = hue * FULL_TURN_IN_RADIANS + half(Math.PI)
    const radius = sat * RADIUS
    const cursorX = RADIUS + radius * Math.cos(angle)
    const cursorY = RADIUS + radius * Math.sin(angle)
    return { cursorX, cursorY }
}

function useColorComponents(
    props: ColorPickerViewProps
): [
    hue: number,
    sat: number,
    lum: number,
    alpha: number,
    setHue: React.Dispatch<React.SetStateAction<number>>,
    setSat: React.Dispatch<React.SetStateAction<number>>,
    setLum: React.Dispatch<React.SetStateAction<number>>,
    setAlpha: React.Dispatch<React.SetStateAction<number>>,
] {
    const [hue, setHue] = React.useState(props.hue)
    const [sat, setSat] = React.useState(props.sat)
    const [lum, setLum] = React.useState(props.lum)
    const [alpha, setAlpha] = React.useState(props.alpha ?? 1)
    React.useEffect(() => {
        setHue(props.hue)
    }, [props.hue])
    React.useEffect(() => {
        setSat(props.sat)
    }, [props.sat])
    React.useEffect(() => {
        setLum(props.lum)
    }, [props.lum])
    return [hue, sat, lum, alpha, setHue, setSat, setLum, setAlpha]
}

function renderLumSlider(
    hue: number,
    sat: number,
    lum: number,
    alpha: number,
    onChange: (h: number, s: number, l: number, a: number) => void,
    setLum: React.Dispatch<React.SetStateAction<number>>
) {
    const update = (value: number) => {
        setLum(value * PERCENT)
        onChange(hue, sat, value * PERCENT, alpha)
    }
    return (
        <>
            <div className="flex">
                <Label value={`Luminance: ${toPercent(lum)} %`} />
                <InputInteger
                    size={2}
                    min={0}
                    max={100}
                    value={Math.round(lum * HUNDRED)}
                    onChange={update}
                />
            </div>
            <Slider
                onChange={update}
                min={0}
                max={100}
                steps={1}
                value={lum * HUNDRED}
            />
        </>
    )
}

function renderSatSlider(
    hue: number,
    sat: number,
    lum: number,
    alpha: number,
    onChange: (h: number, s: number, l: number, a: number) => void,
    setSat: React.Dispatch<React.SetStateAction<number>>
) {
    const update = (value: number) => {
        setSat(value * PERCENT)
        onChange(hue, value * PERCENT, lum, alpha)
    }
    return (
        <>
            <div className="flex">
                <Label value={`Saturation: ${toPercent(sat)} %`} />
                <InputInteger
                    size={2}
                    min={0}
                    max={100}
                    value={Math.round(sat * HUNDRED)}
                    onChange={update}
                />
            </div>
            <Slider
                onChange={update}
                min={0}
                max={100}
                steps={1}
                value={sat * HUNDRED}
            />
        </>
    )
}

function renderHueSlider(
    hue: number,
    sat: number,
    lum: number,
    alpha: number,
    onChange: (h: number, s: number, l: number, a: number) => void,
    setHue: React.Dispatch<React.SetStateAction<number>>
) {
    const update = (value: number) => {
        setHue(value * PERCENT)
        onChange(value * PERCENT, sat, lum, alpha)
    }
    return (
        <>
            <div className="flex">
                <Label value={`Hue: ${toPercent(hue)} %`} />
                <InputInteger
                    size={2}
                    min={0}
                    max={100}
                    value={Math.round(hue * HUNDRED)}
                    onChange={update}
                />
            </div>
            <Slider
                onChange={update}
                min={0}
                max={100}
                steps={1}
                value={hue * HUNDRED}
            />
        </>
    )
}

function renderAlphaSlider(
    hue: number,
    sat: number,
    lum: number,
    alpha: number,
    onChange: (h: number, s: number, l: number, a: number) => void,
    setAlpha: React.Dispatch<React.SetStateAction<number>>
) {
    const update = (value: number) => {
        setAlpha(value * PERCENT)
        onChange(hue, sat, lum, value * PERCENT)
    }
    return (
        <>
            <div className="flex">
                <Label value={`Opacity: ${toPercent(alpha)} %`} />
                <InputInteger
                    size={2}
                    min={0}
                    max={100}
                    value={Math.round(alpha * HUNDRED)}
                    onChange={update}
                />
            </div>
            <Slider
                onChange={update}
                min={0}
                max={100}
                steps={1}
                value={alpha * HUNDRED}
            />
        </>
    )
}

function getClassNames(props: ColorPickerViewProps): string {
    const classNames = ["custom", "ui-view-ColorPickerView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function toPercent(value: number) {
    return Math.round(value * HUNDRED)
}

function getColorCodeFromHSL(hue: number, sat: number, lum: number): string {
    const color = new Color()
    color.H = hue
    color.S = sat
    color.L = lum
    color.hsl2rgb()
    return color.stringify()
}
