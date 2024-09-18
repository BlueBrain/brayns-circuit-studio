import { Model } from "./model-types"
import {
    assertArray,
    assertBoolean,
    assertNumber,
    assertNumberArray,
    assertObject,
    assertString,
    assertStringArray,
    assertVector4,
} from "@/_old_/tool/validator"
import { isModel } from "./model-guards"
import { Vector4 } from "../../../tool/calc"

export type CircuitModel = CircuitModelBbp | CircuitModelSonata

export type SimulationModel = CircuitModel & {
    report: CircuitModelReport
}

export interface CircuitModelBbp extends Model {
    type: "BBP loader"
    targets: string[]
    report?: CircuitModelReport
    gids: string
    /** Percentage between 0.0 and 1.0 */
    density: number
    /** For Soma only, better to set 8. */
    thickness: number
    showAxon: boolean
    showDendrites: boolean
    showSoma: boolean
    showAfferentSynapses: boolean
    showEfferentSynapses: boolean
}

/**
 * CircuitModelSonata represents ONLY ONE population.
 * It's the only wait we can keep a mapping between
 * a population and the Brayns Models that will be
 * created.
 */
export interface CircuitModelSonata extends Model {
    type: "SONATA loader"
    population: { name: string; type: string }
    nodeSets: string[]
    /** Between 0.0 and 1.0 */
    density: number
    showAxon: boolean
    showDendrites: boolean
    showSoma: boolean
    thickness: number
    /** number of cells. */
    size: number
    report?: CircuitModelReport
    reports: CircuitModelReport[]
    afferent: SonataEdge[]
    efferent: SonataEdge[]
    vasculature?: {
        radiusMultiplier: number
    }
}

export interface SonataEdge {
    name: string
    size: number
    density: number
    radius: number
    enabled: boolean
}

export interface CircuitModelReport {
    name: string
    /**
     * - "none"
     * - "spikes"
     * - "compartment"
     * - "summation"
     * - "synapse"
     * - "bloodflow_pressure"
     * - "bloodflow_speed"
     * - "bloodflow_radii"
     */
    type: string
    /** Number of frames. */
    frames: number
    /** Index of the first frame */
    frameStartIndex: number
    /** Index of the last frame */
    frameEndIndex: number
    /** Duration of one frame (expressed in `timeUnit`) */
    frameDuration: number
    /** Duration of the whole simulation in `timeUnit` */
    totalDuration: number
    timeUnit: string
    dataUnit: string
    /**
     * Only used if `type === "spikes"`
     * It's the time for the spike to reach its maximum.
     * This time is expressed in `timeUnit`.
     */
    spikeTransitionTime: number
    /**
     * Voltage range (expressed in `dataUnit`).
     */
    range: [min: number, max: number]
    colorRamp: Vector4[]
}

export function assertCircuitModelReport(
    data: unknown,
    prefix = ""
): asserts data is CircuitModelReport {
    assertObject(data)
    const {
        name,
        type,
        frameStartIndex,
        frameEndIndex,
        frameDuration,
        timeUnit,
        dataUnit,
        spikeTransitionTime,
        range,
        colorRamp,
    } = data
    assertNumberArray(range, `${prefix}.range`)
    assertArray(colorRamp, `${prefix}.colorRamp`)
    for (const color of colorRamp) {
        assertVector4(color, `${prefix}.colorRamp[]`)
    }
    assertString(name, `${prefix}.name`)
    assertString(type, `${prefix}.type`)
    assertNumber(frameStartIndex, `${prefix}.frameStart`)
    assertNumber(frameEndIndex, `${prefix}.frameEnd`)
    assertNumber(frameDuration, `${prefix}.frameDuration`)
    assertString(timeUnit, `${prefix}.timeUnit`)
    assertString(dataUnit, `${prefix}.dataUnit`)
    assertNumber(spikeTransitionTime, `${prefix}.spikeTransitionTime`)
}

export function isCircuitModel(data: unknown): data is CircuitModel {
    try {
        assertObject(data)
        const { type } = data
        if (type === "SONATA loader" && isCircuitModelSonata(data)) return true
        if (type === "BBP loader" && isCircuitModelBbp(data)) return true
        return false
    } catch (ex) {
        console.error(ex)
        return false
    }
}

export function isCircuitModelSonata(
    data: unknown
): data is CircuitModelSonata {
    try {
        assertObject(data)
        if (data.type !== "SONATA loader") return false
        const {
            population,
            density,
            showAxon,
            showDendrites,
            showSoma,
            thickness,
            report,
        } = data
        assertObject(population, "data.population")
        assertString(population.name, "data.population.name")
        assertString(population.type, "data.population.type")
        assertNumber(density, "data.density")
        assertNumber(thickness, "data.thickness")
        assertBoolean(showAxon, "data.showAxon")
        assertBoolean(showDendrites, "data.showDendrites")
        assertBoolean(showSoma, "data.showSoma")
        if (report) assertCircuitModelReport(report, "data.report")
        return isModel(data)
    } catch (ex) {
        console.error("Not a CircuitModelSonata object!", ex)
        return false
    }
}

export function isCircuitModelBbp(data: unknown): data is CircuitModelBbp {
    try {
        assertObject(data)
        if (data.type !== "BBP loader") return false
        const {
            targets,
            gids,
            density,
            showAxon,
            showDendrites,
            showSoma,
            showAfferentSynapses,
            showEfferentSynapses,
            thickness,
            report,
        } = data
        assertString(gids, "gids")
        assertStringArray(targets, "targets")
        assertNumber(density, "density")
        assertNumber(thickness, "thickness")
        assertBoolean(showAxon, "showAxon")
        assertBoolean(showDendrites, "showDendrites")
        assertBoolean(showSoma, "showSoma")
        assertBoolean(showAfferentSynapses, "showAfferentSynapses")
        assertBoolean(showEfferentSynapses, "showEfferentSynapses")
        if (report) assertCircuitModelReport(report, "data.report")
        return isModel(data)
    } catch (ex) {
        console.error("Not a CircuitModelBbp object!", ex)
        return false
    }
}
