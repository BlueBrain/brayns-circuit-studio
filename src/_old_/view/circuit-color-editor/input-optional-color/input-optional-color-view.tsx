import * as React from "react"
import { OptionalColor } from "../types"
import InputColor from "@/_old_/ui/view/input/color"
import Checkbox from "@/_old_/ui/view/checkbox"
import Color from "@/_old_/ui/color"
import Icon from "@/_old_/ui/view/icon"

import Styles from "./input-optional-color-view.module.css"
import Button from "@/_old_/ui/view/button"

export interface InputOptionalColorViewProps {
    className?: string
    label: string
    value: OptionalColor
    onChange(value: OptionalColor): void
    onSelectSingle(this: void): void
}

export default function InputOptionalColorView(
    props: InputOptionalColorViewProps
) {
    const update = (partialValue: Partial<OptionalColor>) => {
        props.onChange({
            ...props.value,
            ...partialValue,
        })
    }
    const handleToggleOpacity = () => {
        const { color } = props.value
        if (!color) return

        const c = Color.fromArrayRGBA(color)
        c.A = c.A > 0.5 ? 0 : 1
        update({
            color: c.toArrayRGBA(),
        })
    }
    return (
        <div className={getClassNames(props)}>
            <Checkbox
                className={Styles.checkbox}
                label={props.label}
                value={props.value.enabled}
                onChange={(enabled) => update({ enabled })}
            />
            <Icon
                name="select"
                className={Styles.selectOnlyMe}
                onClick={props.onSelectSingle}
            />
            <InputColor
                className={Styles.colorInput}
                size={12}
                value={Color.fromArrayRGBA(props.value.color).stringify()}
                enabled={props.value.enabled}
                onChange={(color) =>
                    update({
                        color: Color.fromColorOrString(color).toArrayRGBA(),
                    })
                }
            />
            <Button
                className={Styles.toggleOpacity}
                label="Toggle opacity"
                flat={true}
                onClick={handleToggleOpacity}
            />
        </div>
    )
}

function getClassNames(props: InputOptionalColorViewProps): string {
    const classNames = [Styles.InputOptionalColorView]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (!props.value.enabled) classNames.push("disabled")

    return classNames.join(" ")
}
