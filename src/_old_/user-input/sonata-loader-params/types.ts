export interface SonataLoaderPopulationOptions {
    /** Between 0.0 and 1.0 */
    density: number
    reportType:
        | "none"
        | "spikes"
        | "compartment"
        | "summation"
        | "synapse"
        | "bloodflow_pressure"
        | "bloodflow_speed"
        | "bloodflow_radii"
    /** Ignored if `reportType === "none"` */
    reportName: string
    /** Only used if `reportType === "spikes"` */
    spikeTransitionTime: number
}

export interface SonataLoaderOptions {
    name: string
    path: string
    availablePopulations: string[]
    populations: {
        [populationName: string]: SonataLoaderPopulationOptions
    }
}
