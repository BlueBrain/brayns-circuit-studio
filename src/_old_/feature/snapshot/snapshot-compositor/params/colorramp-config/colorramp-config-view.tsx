import * as React from "react"
import Checkbox from "@/_old_/ui/view/checkbox"
import Combo from "@/_old_/ui/view/combo"
import InputColor from "@/_old_/ui/view/input/color"
import InputNumber from "@/_old_/ui/view/input/integer"
import InputText from "@/_old_/ui/view/input/text"
import { ColorRampConfig } from "../../types"
import "./colorramp-config-view.css"

export interface ColorRampConfigViewProps {
    className?: string
    value: ColorRampConfig
    onChange(this: void, value: ColorRampConfig): void
}

export default function ColorRampConfigView(props: ColorRampConfigViewProps) {
    const { value, onChange } = props
    const update = (upt: Partial<ColorRampConfig>) => {
        onChange({ ...value, ...upt })
    }
    return (
        <fieldset className={getClassNames(props)}>
            <legend>ColorRamp</legend>
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
                    <div className="grid">
                        <InputNumber
                            label="Width"
                            min={8}
                            value={value.barThickness}
                            onChange={(barThickness) =>
                                update({ barThickness })
                            }
                        />
                        <InputNumber
                            label="Height"
                            min={64}
                            value={value.barLength}
                            onChange={(barLength) => update({ barLength })}
                        />
                        <InputNumber
                            label="Intermediary steps"
                            min={0}
                            max={10}
                            value={value.intermediaryStepCount}
                            onChange={(intermediaryStepCount) =>
                                update({ intermediaryStepCount })
                            }
                        />
                        <InputNumber
                            label="Font Size"
                            min={4}
                            value={value.fontSize}
                            onChange={(fontSize) => update({ fontSize })}
                        />
                        <InputText
                            label="Unit"
                            suggestions={["mV", "mA"]}
                            value={value.unit}
                            onChange={(unit) => update({ unit })}
                        />
                        <InputColor
                            label="Color"
                            value={value.textColor}
                            onChange={(textColor) => update({ textColor })}
                        />
                        <Combo
                            label="Align Unit"
                            value={value.showUnit}
                            onChange={(showUnit: "inline" | "top" | "bottom") =>
                                update({ showUnit })
                            }
                            options={{
                                inline: "Inline",
                                top: "Top",
                                bottom: "Bottom",
                            }}
                        />
                    </div>
                </div>
            )}
        </fieldset>
    )
}

function getClassNames(props: ColorRampConfigViewProps): string {
    const classNames = [
        "custom",
        "feature-snapshot-snapshotCompositor-params-ColorrampConfigView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
