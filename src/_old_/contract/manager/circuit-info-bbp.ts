export interface CircuitReport {
    name: string
    startTime: number
    endTime: number
    timeUnit: string
    /** Duration of one frame. */
    timeStep: number
    dataUnit: string
    /** Number of frames in the report (interger). */
    framesCount: number
    /** Number of values per frame (integer). */
    frameSize: number
}

export default abstract class CircuitInfoBbpManagerInterface {
    /**
     * @returns `null` if the report does not exist.
     */
    abstract getReport(
        circuitPath: string,
        reportName: string
    ): Promise<CircuitReport | null>
    abstract getReportNames(circuitPath: string): Promise<string[]>
    /**
     * @returns List of targets names of the given circuit.
     */
    abstract getTargets(circuitPath: string): Promise<string[]>
    /**
     * @returns Array of GIDs of a given circuit, or `[]` in case of failure.
     * @param targets List of targets to restrict the GIDs list on.
     */
    abstract getGIDs(circuitPath: string, targets?: string[]): Promise<number[]>
}

export function ensureCircuitInfoBbpManagerInterface(
    data: unknown
): CircuitInfoBbpManagerInterface {
    if (data instanceof CircuitInfoBbpManagerInterface) return data

    console.error(
        "Was expected to be of type CircuitInfoBbpManagerInterface!",
        data
    )
    throw Error("Was expected to be of type CircuitInfoBbpManagerInterface!")
}

export interface SimulationReportNamesResponse {
    report_names: string[]
}

export interface CIGetTargetNamesResponse {
    targets: string[]
}
