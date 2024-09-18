import * as React from "react"
import Checkbox from "@/_old_/ui/view/checkbox"
import InputColor from "@/_old_/ui/view/input/color"
import { ScalebarConfig } from "../../types"
import "./scalebar-config-view.css"

export interface ScalebarConfigViewProps {
    className?: string
    value: ScalebarConfig
    onChange(this: void, value: ScalebarConfig): void
}

export default function ScalebarConfigView(props: ScalebarConfigViewProps) {
    const { value, onChange } = props
    const update = (upt: Partial<ScalebarConfig>) => {
        onChange({ ...value, ...upt })
    }
    return (
        <fieldset className={getClassNames(props)}>
            <legend>Scalebar</legend>
            <Checkbox
                label="Generate scale bar"
                value={value.enabled}
                onChange={(enabled) => update({ enabled })}
            />
            {value.enabled && (
                <div>
                    <Checkbox
                        label="As a separated file"
                        wide={true}
                        value={value.separatedFile}
                        onChange={(separatedFile) => update({ separatedFile })}
                    />
                    <InputColor
                        label="Color"
                        value={value.textColor}
                        onChange={(color) =>
                            update({ textColor: color, lineColor: color })
                        }
                    />
                </div>
            )}
        </fieldset>
    )
}

function getClassNames(props: ScalebarConfigViewProps): string {
    const classNames = [
        "custom",
        "feature-snapshot-snapshotCompositor-params-ScalebarConfigView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
