import * as React from "react"
import { ColorRampStep } from "@/_old_/view/colorramp-editor"
import Color from "@/_old_/ui/color"
import Checkbox from "@/_old_/ui/view/checkbox"
import InputColor from "@/_old_/ui/view/input/color"
import InputFloat from "@/_old_/ui/view/input/float"
import Flex from "@/_old_/ui/view/flex"
import "./color-step-view.css"

export interface ColorStepViewProps {
    className?: string
    value: ColorRampStep
    minVoltage: number
    maxVoltage: number
    onChange(this: void, value: ColorRampStep): void
}

export default function ColorStepView(props: ColorStepViewProps) {
    const { minVoltage, maxVoltage, onChange } = props
    const [step, setStep] = React.useState(props.value)
    const update = React.useCallback(
        (value: Partial<ColorRampStep>) => {
            const newStep = {
                ...step,
                ...value,
            }
            setStep(newStep)
            onChange(newStep)
        },
        [step]
    )
    const voltage = minVoltage + step.offset * (maxVoltage - minVoltage)
    return (
        <div className={getClassNames(props)}>
            <Flex justifyContent="space-between">
                <InputFloat
                    size={4}
                    truncate={3}
                    value={voltage}
                    min={minVoltage}
                    max={maxVoltage}
                    onChange={(value) =>
                        update({
                            offset:
                                (value - minVoltage) /
                                (maxVoltage - minVoltage),
                        })
                    }
                />
                <InputColor
                    value={Color.fromArrayRGB(step.color).stringify()}
                    onChange={(value) =>
                        update({
                            color: Color.fromColorOrString(value).toArrayRGB(),
                        })
                    }
                />
            </Flex>
            <Checkbox
                wide={true}
                label="Starts a transparent section"
                value={step.transparentSection}
                onChange={(transparentSection) =>
                    update({ transparentSection })
                }
            />
        </div>
    )
}

function getClassNames(props: ColorStepViewProps): string {
    const classNames = [
        "custom",
        "view-circuitColorEditor-colorBySection-ColorStepView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
