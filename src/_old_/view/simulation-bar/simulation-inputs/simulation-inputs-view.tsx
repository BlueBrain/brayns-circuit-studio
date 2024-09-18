import * as React from "react"
import InputFloat from "@/_old_/ui/view/input/float"
import InputInteger from "@/_old_/ui/view/input/integer"
import { SimulationState } from "../types"
import "./simulation-inputs-view.css"

export interface SimulationInputsViewProps {
    className?: string
    simulation: SimulationState
    onCurrentStepChange(this: void, step: number): void
    onSpeedChange(this: void, speed: number): void
}

export default function SimulationInputsView(props: SimulationInputsViewProps) {
    const [simulation, onCurrentStepChange, onSpeedChange] =
        useSimulation(props)
    return (
        <div className={getClassNames(props.className)}>
            <div className="two-columns-info">
                <div>Number of steps: </div>
                <div>
                    <b>{simulation.stepsCount}</b>
                </div>
                <div>Simulation duration: </div>
                <div>
                    <b>
                        {convertStepsToTime(simulation, simulation.stepsCount)}
                    </b>{" "}
                    {simulation.timeUnit}
                </div>
            </div>

            <hr />
            {renderStep(simulation, onCurrentStepChange)}
            {renderPlayback(simulation, onSpeedChange)}
        </div>
    )
}

function useSimulation(
    props: SimulationInputsViewProps
): [
    simulation: SimulationState,
    onCurrentStepChange: (this: void, step: number) => void,
    onSpeedChange: (this: void, speed: number) => void,
] {
    const [simulation, setSimulation] = React.useState(props.simulation)
    const onCurrentStepChange = (currentStep: number) => {
        setSimulation({
            ...simulation,
            currentStep,
        })
        props.onCurrentStepChange(currentStep)
    }
    const onSpeedChange = (speed: number) => {
        setSimulation({
            ...simulation,
            speed,
        })
        props.onSpeedChange(speed)
    }
    return [simulation, onCurrentStepChange, onSpeedChange]
}

function renderPlayback(
    simulation: SimulationState,
    onSpeedChange: (speed: number) => void
) {
    return (
        <div className="flex">
            <InputFloat
                wide={true}
                label="Playback (index/s)"
                value={simulation.speed}
                onChange={onSpeedChange}
            />
            <InputFloat
                wide={true}
                label={`Playback time (s)`}
                value={convertSpeedToTime(simulation)}
                onChange={(time: number) =>
                    onSpeedChange(convertTimeToSpeed(simulation, time))
                }
            />
        </div>
    )
}

function renderStep(
    simulation: SimulationState,
    onCurrentStepChange: (step: number) => void
) {
    return (
        <div className="flex">
            <InputInteger
                wide={true}
                label="Step (index)"
                min={0}
                max={simulation.stepsCount - 1}
                value={simulation.currentStep}
                onChange={onCurrentStepChange}
            />
            <InputFloat
                wide={true}
                label={`Step time (${simulation.timeUnit})`}
                min={0}
                max={convertStepsToTime(simulation, simulation.stepsCount - 1)}
                value={convertStepsToTime(simulation)}
                onChange={(time: number) =>
                    onCurrentStepChange(convertTimeToSteps(simulation, time))
                }
            />
        </div>
    )
}

function getClassNames(className?: string): string {
    const classNames = ["custom", "view-simulationBar-SimulationInputsView"]
    if (typeof className === "string") {
        classNames.push(className)
    }

    return classNames.join(" ")
}

/**
 * Convert a simulation step index into a time in the current unit.
 */
function convertStepsToTime(
    simulation: SimulationState,
    step?: number
): number {
    return truncate(
        simulation.timeBetweenSteps * (step ?? simulation.currentStep)
    )
}

function convertTimeToSteps(simulation: SimulationState, time: number) {
    return Math.round(time / simulation.timeBetweenSteps)
}

function convertSpeedToTime(
    simulation: SimulationState,
    speed?: number
): number {
    const playbackTimeInSeconds =
        simulation.stepsCount / (speed ?? simulation.speed)
    return truncate(playbackTimeInSeconds)
}

function convertTimeToSpeed(simulation: SimulationState, time: number) {
    return truncate(simulation.stepsCount / time)
}

const DEFAULT_TRUNCATE_DIGITS = 3

function truncate(value: number, digits = DEFAULT_TRUNCATE_DIGITS) {
    const TEN = 10
    return Math.floor(value * TEN ** digits) * TEN ** -digits
}
