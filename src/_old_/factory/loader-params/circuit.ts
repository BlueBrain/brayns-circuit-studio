import { LoaderParams } from "@/_old_/contract/factory/loader-params"
import {
    CircuitModel,
    CircuitModelBbp,
    CircuitModelSonata,
} from "@/_old_/contract/manager/models/types/circuit-model"
import { isArray } from "@/_old_/tool/validator"
import { expandRange } from "../../manager/scene/tools"

export function makeLoaderParamsForCircuit(
    circuit: CircuitModel
): LoaderParams {
    if (circuit.type === "SONATA loader") {
        return {
            loader_name: circuit.type,
            loader_properties: makeLoaderPropertiesForCircuitSonata(circuit),
            path: circuit.path,
        }
    }
    if (circuit.type === "BBP loader") {
        return {
            loader_name: circuit.type,
            loader_properties: makeLoaderPropertiesForCircuitBbp(circuit),
            path: circuit.path,
        }
    }
    throw Error(`Invalid circuit type!`)
}

function makeLoaderPropertiesForCircuitSonata(
    circuit: CircuitModelSonata
): Record<string, unknown> {
    const { report, nodeSets } = circuit
    const population: SonataLoaderPropertiesPopulation = {
        node_population: circuit.population.name,
        node_percentage: circuit.density,
        report_type: "none",
        neuron_morphology_parameters: {
            load_axon: circuit.showAxon,
            load_dendrites: circuit.showDendrites,
            load_soma: circuit.showSoma,
            radius_multiplier: figureOutThickness(circuit),
            resampling: 1,
            subsampling: 1,
        },
    }
    if (circuit.population.type === "vasculature") {
        population.vasculature_geometry_parameters = {
            radius_multiplier: figureOutThickness(circuit),
        }
    }
    if (report) {
        population.report_name = report.name
        population.report_type = report.type
        population.spike_transition_time = report.spikeTransitionTime
    }
    if (nodeSets.length > 0) {
        population.node_sets = nodeSets
    }
    const edges: SonataLoaderPropertiesPopulationEdge[] = [
        ...circuit.afferent
            .filter(({ enabled }) => enabled)
            .map((edge) => {
                const out: SonataLoaderPropertiesPopulationEdge = {
                    edge_populations: circuit.name,
                    load_afferent: true,
                    edge_percentage: edge.density * 1e-2,
                    /**
                     * 100 % => 2.0
                     */
                    radius: 2 * edge.radius * 1e-2,
                }
                return out
            }),
        ...circuit.efferent
            .filter(({ enabled }) => enabled)
            .map((edge) => {
                const out: SonataLoaderPropertiesPopulationEdge = {
                    edge_populations: circuit.name,
                    load_afferent: false,
                    edge_percentage: edge.density * 1e-2,
                    /**
                     * 100 % => 2.0
                     */
                    radius: 2 * edge.radius * 1e-2,
                }
                return out
            }),
    ]
    population.edge_populations = edges
    return {
        node_population_settings: [population],
    }
}

function makeLoaderPropertiesForCircuitBbp(circuit: CircuitModelBbp) {
    const props: Record<string, unknown> = {
        percentage: circuit.density,
        targets: circuit.targets,
        gids: expandRange(circuit.gids),
        report_type: "none",
        report_name: "",
        neuron_morphology_parameters: {
            /**
             * Parameter to multiply all morphology sample radii by. Must be > 0.0.
             * Ignored if 'radius_override' > 0.0
             */
            radius_multiplier: figureOutThickness(circuit),
            load_axon: circuit.showAxon,
            load_dendrites: circuit.showDendrites,
            load_soma: circuit.showSoma,
            resampling: 1,
            subsampling: 1,
        },
        load_afferent_synapses: circuit.showAfferentSynapses,
        load_efferent_synapses: circuit.showEfferentSynapses,
    }
    if (isEmptyArray(props.gids)) {
        // Brayns does not accept empty GIDs array.
        delete props.gids
    }
    if (isEmptyArray(props.targets)) {
        // Brayns does not accept empty targets array.
        delete props.targets
    }
    if (circuit.report && circuit.report.name !== "none") {
        props.report_type = circuit.report.type
        props.report_name = circuit.report.name
    }
    return props
}

export interface SonataLoaderProperties {
    node_population_settings: SonataLoaderPropertiesPopulation[]
}

export interface SonataLoaderPropertiesPopulationEdge {
    /**
     * Percentage of edges to load from all available.
     * Default: 1
     */
    edge_percentage?: number
    /**
     * Name of the edge population to load.
     */
    edge_populations: string
    /**
     * Name of a synapse report to load along the edge population.
     */
    edge_report_name?: string
    /**
     * Wether to load afferent or efferent edges.
     */
    load_afferent: boolean
    /**
     * Radius used for the synapse sphere geometry (Ignored for endfeet).
     * Default: 2
     */
    radius?: number
}

export interface SonataLoaderPropertiesPopulation {
    /**
     * List of edge populations and their settings to be loaded.
     */
    edge_populations?: SonataLoaderPropertiesPopulationEdge[]
    /**
     * Settings to configure the morphology geometry load.
     * Ignored for vasculature populations.
     */
    neuron_morphology_parameters?: {
        /**
         * Geometry generation configuration.
         * Default: "smooth"
         */
        geometry_type?:
            | "original"
            | "smooth"
            | "section_smooth"
            | "constant_radii"
        /**
         * Default: false
         */
        load_axon?: boolean
        /**
         * Default: false
         */
        load_dendrites?: boolean
        /**
         * Default: false
         */
        load_soma?: boolean
        /**
         * Parameter to multiply all morphology sample radii by.
         * Default 1
         */
        radius_multiplier?: number
        resampling: number
        subsampling: number
    }
    /**
     * List of node IDs to load from the population.
     * Invalidates `node_percentage` and `node_sets`
     */
    node_ids?: number[]
    /**
     * Percentage of nodes to load after filter them by whichever node
     * sets have been specified. Ignored if a lsit of node ids is provided.
     */
    node_percentage?: number
    /**
     * Name of the node population to load.
     */
    node_population: string
    /**
     * List of node set names/regex to filter the node population load.
     * Ignored if a list of node ids is provided.
     */
    node_sets?: string[]
    /**
     * Name of the report file to load.
     * Ignored if report_type is "none" or "spikes".
     */
    report_name?: string
    /**
     * Type of report to load for the given node population.
     * - "none"
     * - "spikes"
     * - "compartment"
     * - "summation"
     * - "synapse"
     * - "bloodflow_pressure"
     * - "bloodflow_speed"
     * - "bloodflow_radii"
     */
    report_type?: string
    /**
     * When loading a spike report, fade-in and fade-out time,
     * in milliseconds, from resting state to spike state.
     */
    spike_transition_time?: number
    /**
     * Settings to configure the vasculature geometry load.
     * Ignored for any node population that is not vasculature.
     */
    vasculature_geometry_parameters?: {
        /**
         * Settings to configure the vasculature geometry load.
         * Ignored for any node population that is not vasculature.
         * Default: 1
         */
        radius_multiplier?: number
    }
}

function isEmptyArray(data: unknown) {
    if (!isArray(data)) return false
    return data.length === 0
}

function figureOutThickness(circuit: {
    thickness: number
    showAxon: boolean
    showDendrites: boolean
    showSoma: boolean
}) {
    if (!circuit.showSoma && !circuit.showAxon && !circuit.showDendrites)
        return circuit.thickness * 10
    return circuit.thickness
}
