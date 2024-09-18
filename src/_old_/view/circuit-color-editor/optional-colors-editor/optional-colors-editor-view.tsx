import * as React from "react"
import { OptionalColor } from "../types"
import InputOptionalColor from "../input-optional-color"
import Button from "@/_old_/ui/view/button"
import "./optional-colors-editor-view.css"
import {
    extractEnabledColors,
    selectAll,
    deselectAll,
    invertSelection,
    selectOnly,
} from "./selection"
import { applySingle, applyRainbow, applyRandom } from "./color"

export interface Colors {
    [name: string]: OptionalColor
}

export interface OptionalColorsEditorViewProps {
    className?: string
    /** Names of the available colors */
    names: string[]
    /**
     * By default the checkboxes labels are the elements of `names`.
     * This can be changed by defining a `rewrite` function.
     */
    rewrite?(name: string): string
    value: Colors
    onChange(value: Colors): void
}

export default function OptionalColorsEditorView(
    props: OptionalColorsEditorViewProps
) {
    const enabledColors: Colors = extractEnabledColors(props.value)
    const hasEnabledColors = Object.keys(enabledColors).length > 0
    return (
        <div className={getClassNames(props)}>
            {renderColorButtons(props, enabledColors, hasEnabledColors)}
            {renderSelectionButton(props)}
            {renderColorInputList(props)}
        </div>
    )
}

function renderColorButtons(
    props: OptionalColorsEditorViewProps,
    enabledColors: Colors,
    hasEnabledColors: boolean
) {
    return (
        <fieldset className="flex">
            <legend>Change all the selected colors</legend>
            <Button
                label="Single"
                onClick={() =>
                    props.onChange({
                        ...props.value,
                        ...applySingle(props.names, enabledColors),
                    })
                }
                enabled={hasEnabledColors}
            />
            <Button
                label="Rainbow"
                onClick={() =>
                    props.onChange({
                        ...props.value,
                        ...applyRainbow(props.names, enabledColors),
                    })
                }
                enabled={hasEnabledColors}
            />
            <Button
                label="Random"
                onClick={() =>
                    props.onChange({
                        ...props.value,
                        ...applyRandom(props.names, enabledColors),
                    })
                }
                enabled={hasEnabledColors}
            />
        </fieldset>
    )
}

function renderSelectionButton(props: OptionalColorsEditorViewProps) {
    return (
        <fieldset className="flex">
            <legend>Selection (only enabled colors will be applied)</legend>
            <Button
                label="All"
                icon="select"
                onClick={() => props.onChange(selectAll(props.value))}
            />
            <Button
                label="None"
                icon="deselect"
                onClick={() => props.onChange(deselectAll(props.value))}
            />
            <Button
                label="Invert"
                icon="swap"
                onClick={() => props.onChange(invertSelection(props.value))}
            />
        </fieldset>
    )
}

function getClassNames(props: OptionalColorsEditorViewProps): string {
    const classNames = [
        "custom",
        "view-circuitColorEditor-OptionalColorsEditorView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function renderColorInputList(
    props: OptionalColorsEditorViewProps
): React.ReactNode {
    return (
        <div className="list">
            {props.names.map((name) => (
                <InputOptionalColor
                    key={name}
                    label={props.rewrite ? props.rewrite(name) : name}
                    value={
                        props.value[name] ?? {
                            enabled: false,
                            color: [0, 0, 0, 1],
                        }
                    }
                    onChange={(color) => {
                        props.onChange({
                            ...props.value,
                            [name]: color,
                        })
                    }}
                    onSelectSingle={() =>
                        props.onChange(selectOnly(props.value, name))
                    }
                />
            ))}
        </div>
    )
}
