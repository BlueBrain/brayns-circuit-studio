import * as React from "react"
import Button from "@/_old_/ui/view/button"
import Color from "@/_old_/ui/color"
import ColorChip from "@/_old_/ui/view/color-chip"
import ColorPicker from "@/_old_/ui/view/color-picker"
import InputInteger from "@/_old_/ui/view/input/integer"
import Label from "@/_old_/ui/view/label"
import Slider from "@/_old_/ui/view/slider"
import { HUNDRED } from "../../constants"
import { Vector4 } from "@/_old_/contract/tool/calc"
import "./full-color-picker-view.css"

export interface FullColorPickerViewProps {
    className?: string
    value: Vector4
    onValidate(value: Vector4): void
    onCancel(this: void): void
}

export default function FullColorPickerView(props: FullColorPickerViewProps) {
    const [color, setColor] = React.useState(props.value)
    const opacity = color[3]
    const setOpacity = (value: number) => {
        color[3] = value / HUNDRED
        setColor([...color])
    }
    const [H, S, L] = toHSL(color)
    return (
        <div className={getClassNames(props)}>
            <main>
                <ColorPicker
                    hue={H}
                    sat={S}
                    lum={L}
                    onChange={(hue, sat, lum) => {
                        const c = Color.fromHSLA(hue, sat, lum, opacity)
                        c.hsl2rgb()
                        setColor(c.toArrayRGBA())
                    }}
                />
                <div className="flex">
                    <Label value={`Opacity: ${toPercent(opacity)} %`} />
                    <InputInteger
                        size={2}
                        min={0}
                        max={100}
                        value={Math.round(opacity * HUNDRED)}
                        onChange={setOpacity}
                    />
                </div>
                <Slider
                    onChange={setOpacity}
                    min={0}
                    max={100}
                    steps={1}
                    value={opacity * HUNDRED}
                />
            </main>
            <footer className="theme-color-section">
                <Button label="Cancel" flat={true} onClick={props.onCancel} />
                <Button
                    label="OK"
                    icon={<ColorChip color={color} />}
                    onClick={() => props.onValidate(color)}
                />
            </footer>
        </div>
    )
}

function getClassNames(props: FullColorPickerViewProps): string {
    const classNames = [
        "custom",
        "view-FullColorPickerView",
        "theme-color-frame",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function toPercent(value: number): number {
    return Math.round(value * HUNDRED)
}

function toHSL(value: Vector4): [number, number, number] {
    const color = Color.fromArrayRGBA(value)
    color.rgb2hsl()
    return [color.H, color.S, color.L]
}
