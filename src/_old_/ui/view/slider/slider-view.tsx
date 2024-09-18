import "./slider-view.css"

import * as React from "react"

import { clamp, clamp01, HALF, half } from "@/_old_/constants"

import { usePanGesture } from "@/_old_/ui/hooks"
import { PositionEvent } from "@/_old_/ui/hooks/pan-gesture"

export interface SliderViewProps {
    className?: string
    wide?: boolean
    /** Minimal value. Default to 0 */
    min?: number
    /** Maximal value. Default to 100 */
    max?: number
    value: number
    /** Minimal delta between two different values */
    steps?: number
    onChange(this: void, value: number): void
}

const DEFAULT_MIN_VALUE = 0
const DEFAULT_MAX_VALUE = 100
const MIN_STEP = 1e-6

/**
 * @see https://material.io/components/sliders
 */
export default function SliderView(props: SliderViewProps) {
    const { onChange } = props
    const min = props.min ?? DEFAULT_MIN_VALUE
    const max = props.max ?? DEFAULT_MAX_VALUE
    const steps = Math.max(MIN_STEP, props.steps ?? 1)
    const [value, setValue] = React.useState(clamp(props.value, min, max))
    React.useEffect(() => setValue(clamp(props.value, min, max)), [props.value])
    const update = useUpdateCallback(min, max, steps, setValue, onChange)
    const refTrack = usePanGesture<HTMLDivElement>({
        onStart: update,
        onPan: update,
        onEnd: update,
    })
    useKeyboardHandler(refTrack, value, min, max, steps, setValue, onChange)
    if (min >= max) return <Error min={min} max={max} />
    const PERCENT = 100
    const percent = `${(PERCENT * (value - min)) / (max - min)}%`
    return (
        <div className={getClassNames(props)} ref={refTrack} tabIndex={0}>
            <div className="track"></div>
            <div className="bar" style={{ width: percent }}></div>
            <button className="thumb" style={{ left: percent }}></button>
        </div>
    )
}

/**
 * With Keyboard, using Up and Bottom arrow will perform big steps.
 * Pressing Up arrow once is the same as pressing Left arrow BIG_STEP times.
 */
const BIG_STEP = 10

function useKeyboardHandler(
    ref: React.MutableRefObject<HTMLDivElement | null>,
    value: number,
    min: number,
    max: number,
    steps: number,
    setValue: (this: void, val: number) => void,
    onChange: (this: void, val: number) => void
) {
    React.useEffect(() => {
        const div = ref.current
        if (!div) return undefined

        const handleKeyDown = makeKeyDownHandler(
            steps,
            min,
            value,
            max,
            setValue,
            onChange
        )
        div.addEventListener("keydown", handleKeyDown, true)
        return () => div.removeEventListener("keydown", handleKeyDown, true)
    }, [ref, value, min, max, steps])
}

function makeKeyDownHandler(
    steps: number,
    min: number,
    value: number,
    max: number,
    setValue: (this: void, val: number) => void,
    onChange: (this: void, val: number) => void
) {
    return (evt: KeyboardEvent) => {
        let delta = 0
        switch (evt.key) {
            case "ArrowLeft":
                delta = -steps
                break
            case "ArrowRight":
                delta = steps
                break
            case "ArrowUp":
                delta = steps * BIG_STEP
                break
            case "ArrowDown":
                delta = -steps * BIG_STEP
                break
            case "Home":
                delta = min - value
                break
            case "End":
                delta = max - value
                break
            case ".":
                delta = half(min + max) - value
                break
            default:
                return
        }
        const newValue = clamp(value + delta, min, max)
        if (newValue === value) return

        setValue(newValue)
        onChange(newValue)
    }
}

function getClassNames(props: SliderViewProps): string {
    const classNames = ["custom", "ui-view-SliderView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (props.wide === true) classNames.push("wide")

    return classNames.join(" ")
}

function Error(props: { min: number; max: number }) {
    return (
        <div>
            ERROR! min = {props.min} {" > "} max = {props.max}
        </div>
    )
}

function useUpdateCallback(
    min: number,
    max: number,
    steps: number,
    setValue: (this: void, value: number) => void,
    onChange: (this: void, value: number) => void
) {
    return React.useCallback(
        (evt: PositionEvent) => {
            const percent = clamp01(evt.relX)
            const v = min + (max - min) * percent
            const step = min + steps * Math.floor(HALF + (v - min) / steps)
            const newValue = clamp(step, min, max)
            setValue(newValue)
            onChange(newValue)
        },
        [max, min, onChange, steps]
    )
}
