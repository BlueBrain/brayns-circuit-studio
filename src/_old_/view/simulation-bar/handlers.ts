import { SimulationState } from "./types"

export function makeTogglePlayHandler(
    simulation: SimulationState,
    onPlay: (this: void) => void,
    onStop: (this: void) => void
) {
    return () => {
        if (simulation.playing) onStop()
        else onPlay()
    }
}

export function makeStepChangeHandler(
    simulation: SimulationState,
    setSimulation: (value: SimulationState | null) => void,
    onStepChange: (step: number) => void
) {
    return (step: number) => {
        const newSimul: SimulationState = {
            ...simulation,
            currentStep: step,
        }
        setSimulation(newSimul)
        onStepChange(step)
    }
}
