import * as React from "react"
import FloatingButton from "@/_old_/ui/view/floating-button"
import { useModal } from "@/_old_/ui/modal"
import SimulationInputs from "./simulation-inputs"
import SimulationState from "./simulation-state"
import Slider from "@/_old_/ui/view/slider"
import Touchable from "@/_old_/ui/view/touchable"
import { makeTogglePlayHandler } from "./handlers"
import { SimulationModuleInterface } from "@/_old_/contract/manager/scene"
import "./simulation-bar-view.css"
import { ModalManagerInterface } from "../../contract/manager/modal"

export interface SimulationBarViewProps {
    className?: string
    simulation: SimulationModuleInterface
    onPlay(this: void): void
    onStop(this: void): void
    onStepChange(this: void, step: number): void
    onSpeedChange(this: void, speed: number): void
}

export default function SimulationBarView(props: SimulationBarViewProps) {
    const modal = useModal()
    const [simulation, setSimulation] = React.useState<SimulationState>(
        new SimulationState(props.simulation)
    )
    React.useEffect(() => {
        const event = props.simulation.eventChange
        const update = (sim: SimulationModuleInterface) =>
            setSimulation(new SimulationState(sim))
        event.add(update)
        return () => event.remove(update)
    }, [props.simulation])
    // We hide the simulation bar if no simulation is currently available.
    if (!simulation.enabled) return null

    const handleTogglePlay = makeTogglePlayHandler(
        simulation,
        props.onPlay,
        props.onStop
    )
    const handleEdit = makeEditHandler(modal, simulation, props)
    return (
        <div className={getClassNames(props)}>
            {renderPlayPauseButton(simulation, handleTogglePlay)}
            <Touchable
                className="info theme-shadow-button"
                color="primary"
                onClick={handleEdit}
            >
                <div>{simulation.currentStep}</div>
                <div>/ {simulation.stepsCount - 1}</div>
            </Touchable>
            <SimulationSlider
                simulation={simulation}
                handleStepChange={props.onStepChange}
            />
        </div>
    )
}

function makeEditHandler(
    modal: ModalManagerInterface,
    simulation: SimulationState,
    props: SimulationBarViewProps
) {
    const handler = async () => {
        const backupState: SimulationState = { ...simulation }
        const updateState = (state: SimulationState) => {
            props.onStepChange(state.currentStep)
            props.onSpeedChange(state.speed)
        }
        const confirm = await modal.confirm({
            title: "Simulation settings",
            align: "TL",
            labelOK: "Apply",
            content: (
                <SimulationInputs
                    simulation={simulation}
                    onCurrentStepChange={props.onStepChange}
                    onSpeedChange={props.onSpeedChange}
                />
            ),
        })
        if (!confirm) updateState(backupState)
    }
    return () => void handler()
}

function renderPlayPauseButton(
    simulation: SimulationState,
    handleTogglePlay: () => void
) {
    return (
        <div>
            <FloatingButton
                small={true}
                icon={simulation.playing ? "pause" : "play"}
                theme={simulation.playing ? "light" : "dark"}
                onClick={handleTogglePlay}
            />
        </div>
    )
}

function SimulationSlider(props: {
    simulation: SimulationState
    handleStepChange(this: void, step: number): void
}) {
    const { simulation, handleStepChange } = props
    return (
        <div className="bar">
            {simulation.playing && (
                <progress
                    value={simulation.currentStep}
                    max={simulation.stepsCount - 1}
                ></progress>
            )}
            {!simulation.playing && (
                <Slider
                    value={simulation.currentStep}
                    min={0}
                    max={simulation.stepsCount - 1}
                    onChange={handleStepChange}
                />
            )}
        </div>
    )
}

function getClassNames(props: SimulationBarViewProps): string {
    const classNames = ["custom", "view-SimulationBarView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
