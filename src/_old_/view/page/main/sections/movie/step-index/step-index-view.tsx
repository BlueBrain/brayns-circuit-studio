import { SimulationModuleInterface } from "@/_old_/contract/manager/scene"
import Button from "@/_old_/ui/view/button"
import InputInteger from "@/_old_/ui/view/input/integer"
import * as React from "react"
import Style from "./step-index-view.module.css"

export interface StepIndexViewProps {
    label: string
    value: number
    onChange(this: void, value: number): void
    simulation: SimulationModuleInterface
}

export default function StepIndexView({
    label,
    value,
    onChange,
    simulation,
}: StepIndexViewProps) {
    return (
        <div className={Style.stepIndex}>
            <InputInteger
                label={label}
                size={9}
                value={value}
                onChange={onChange}
                min={0}
                max={simulation.stepsCount - 1}
            />
            <Button
                label="Get"
                icon="arrow-left"
                onClick={() => onChange(simulation.currentStep)}
            />
            <Button
                label="Set"
                icon="arrow-right"
                flipIcon={true}
                onClick={() => {
                    simulation.currentStep = value
                }}
            />
        </div>
    )
}
