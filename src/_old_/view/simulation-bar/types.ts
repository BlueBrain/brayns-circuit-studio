export interface SimulationState {
    currentStep: number
    enabled: boolean
    playing: boolean
    speed: number
    stepsCount: number
    timeBetweenSteps: number
    timeUnit: string
}
