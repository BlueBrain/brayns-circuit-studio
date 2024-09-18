import { SimulationModuleInterface } from "@/_old_/contract/manager/scene"

export default class SimulationState
    implements
        Omit<SimulationModuleInterface, "eventChange" | "reloadParameters">
{
    public readonly playing: boolean
    public readonly speed: number
    public readonly currentStep: number
    public readonly enabled: boolean
    public readonly stepsCount: number
    public readonly timeBetweenSteps: number
    public readonly timeUnit: string

    constructor(simulation: SimulationModuleInterface) {
        this.playing = simulation.playing
        this.speed = simulation.speed
        this.currentStep = simulation.currentStep
        this.enabled = simulation.enabled
        this.stepsCount = simulation.stepsCount
        this.timeBetweenSteps = simulation.timeBetweenSteps
        this.timeUnit = simulation.timeUnit
    }
}
