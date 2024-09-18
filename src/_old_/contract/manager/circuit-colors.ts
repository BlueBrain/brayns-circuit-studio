import { ColorByGIDs } from "../service/colors"

/**
 * Each color component is a float between 0 and 1.
 */
export type ColorRGBA = [
    red: number,
    green: number,
    blue: number,
    alpha: number,
]

export type ColorGradient = Array<{
    /** Between 0 and 1. */
    offset: number
    color: ColorRGBA
}>

export default interface CircuitColorManagerInterface {
    /**
     * This is always possible to set a single color to the whole model.
     * @param color A single color to be used in the whole model.
     */
    applySingleColor(color: ColorRGBA): Promise<void>

    /**
     * By knowing if the model is not currently colored with simulation data,
     * we can warn the user when they move the simulation bar that they will
     * not see any color changing until they apply colors byb simulation.
     */
    readonly isSimulationColoringActive: boolean

    /**
     * Colors are taken from the current simulation step.
     * @returns `false` is this model has no simulation data.
     */
    applyColorFromSimulation(
        gradient: ColorGradient,
        minRange: number,
        maxRange: number
    ): Promise<boolean>

    readonly canApplyColorFromSimulation: boolean

    /**
     * Apply colors by GIDs.
     * @param rangeDefinition List of GIDs in "extended range" format.
     * Ex.: "17", "5-9", "7,8,12" or even "3,7,10-99,105,200-999".
     * @param color Color to apply to alll the cells whose GID
     * is in `rangeDefinition`.
     * @param setProgress This callback will be called with values from 0.0 to 1.0.
     * @returns `false` if this model does not accept colors by GIDs.
     */
    applyColorByGIDs(
        colors: ColorByGIDs[],
        setProgress?: (percent: number) => void
    ): Promise<boolean>

    /**
     * List of all the layers on which we can apply colors.
     */
    readonly colorableLayers: string[]

    /**
     * Apply colors by layers.
     * @param colors Mapping between layers and colors.
     * @return `false` if at least one of the layers cannot
     * be colored.
     */
    applyColorByLayers(colors: { [layer: string]: ColorRGBA }): Promise<boolean>

    /**
     * List of all the morphology types on which we can apply colors.
     */
    readonly colorableMorphologyTypes: string[]

    /**
     * Apply colors by morphology types.
     * @param colors Mapping between morphology types and colors.
     * @return `false` if at least one of the morphology types cannot
     * be colored.
     */
    applyColorByMorphologyTypes(colors: {
        [morphologyType: string]: ColorRGBA
    }): Promise<boolean>

    /**
     * List of all the electrical types on which we can apply colors.
     */
    readonly colorableElectricalTypes: string[]

    /**
     * Apply colors by electrical types.
     * @param colors Mapping between electrical types and colors.
     * @return `false` if at least one of the electrical types cannot
     * be colored.
     */
    applyColorByElectricalTypes(colors: {
        [electricalType: string]: ColorRGBA
    }): Promise<boolean>

    /**
     * List of all the morphology names on which we can apply colors.
     */
    readonly colorableMorphologyNames: string[]

    /**
     * Apply colors by morphology names.
     * @param colors Mapping between morphology names and colors.
     * @return `false` if at least one of the morphology names cannot
     * be colored.
     */
    applyColorByMorphologyNames(colors: {
        [morphologyName: string]: ColorRGBA
    }): Promise<boolean>

    /**
     * List of all the morphology sections on which we can apply colors.
     */
    readonly colorableMorphologySections: string[]

    /**
     * Apply colors by morphology sections.
     * @param colors Mapping between morphology sections and colors.
     * @return `false` if at least one of the morphology sections cannot
     * be colored.
     */
    applyColorByMorphologySections(colors: {
        [morphologySection: string]: ColorRGBA
    }): Promise<boolean>

    /**
     * @returns A sorted array of all the targets' names
     * in the circuit.
     */
    listTargets(): Promise<string[]>

    /**
     * @returns A sorted array of the GIDs of all cells in the circuit.
     */
    listGIDs(): Promise<number[]>

    /**
     * @returns A sorted array of the GIDs of all cells of a given
     * target in the circuit.
     */
    listGIDsForTarget(target: string): Promise<number[]>

    /**
     * Get the colorramp and the voltage range for the current circuit.
     */
    getColorRamp(): Promise<{
        gradient: ColorGradient
        range: [min: number, max: number]
    }>
}
