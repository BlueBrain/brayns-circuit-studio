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

export interface ColorByGIDs {
    /**
     * List of GIDs in "extended range" format.
     * Ex.: "17", "5-9", "7,8,12" or even "3,7,10-99,105,200-999".
     */
    rangeDefinition: string
    /**
     * Color to apply to the range of cells.
     */
    color: ColorRGBA
}

export interface ColorServiceInterface {
    /**
     * Apply the same `color` to all the cells of this `modelId`.
     */
    applyUniqueColor(modelId: number, color: ColorRGBA): Promise<void>

    /**
     * Apply a `color` to all the cells of given `cellsGIDs`
     * for model `modelId`.
     * @param cellsGIDsRangeDefinition String that defined a set of GIDs.
     * Ex.: "42", "1,2,3,4,5", "1-5", "5-9,11,15-42", ...
     */
    applyColorToCells(
        modelId: number,
        colors: ColorByGIDs[],
        setProgress?: (percent: number) => void
    ): Promise<void>

    /**
     * Depending on the model, predefined colors schemes can be applied.
     * @returns A list of all the available color schemes names.
     */
    getAvailableColorSchemes(modelId: number): Promise<string[]>

    /**
     * A color scheme can be applied alone or with parameters.
     * The parameters are:
     * - a color
     * - a generic string (called option)
     * @returns A list of strings you can use as option for this color scheme.
     */
    getColorSchemeOptions(
        modelId: number,
        colorSchemeName: string
    ): Promise<string[]>

    /**
     * Apply a color scheme to a model.
     * @see getAvailableColorSchemes
     */
    applyColorScheme(
        modelId: number,
        colorSchemeName: string,
        values: { [name: string]: ColorRGBA }
    ): Promise<void>

    /**
     * Gradients are (most of the time) used to map colors over simulation
     * values. They map a float between 0 and 1 and an interpolated `ColorRGBA`.
     */
    getGradient(
        modelId: number
    ): Promise<{ gradient: ColorGradient; range: [min: number, max: number] }>

    /**
     * Gradients are (most of the time) used to map colors over simulation
     * values. They map a float between 0 and 1 and an interpolated `ColorRGBA`.
     */
    setGradient(
        modelId: number,
        gradient: ColorGradient,
        minRange: number,
        maxRange: number
    ): Promise<void>
}
