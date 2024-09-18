import { BraynsApiTransferFunction } from "../service/brayns-api/brayns-api"

export interface ColorRampCanvasPainterOptions {
    transferFunction: BraynsApiTransferFunction
    /** Unit in which the range is expressed. */
    unit: string
    /** Where to display the range min and max values. */
    showRange: "right" | "left" | "none"
    /** How many intermediary steps (between min/max values) we want to show */
    intermediaryStepCount: number
    /** Where to display the range unit. */
    showUnit: "inline" | "top" | "bottom"
    /**
     * Background fill color. Default to "transparent".
     * Default to "".
     */
    background: string
    /** Font color. Default to "white". */
    textColor: string
    /** Height of the text in pixels. Default to 12. */
    fontSize: number
    /**
     * Gap (expressed in pixels) between the text and the bar.
     * Default to a quarter of the font size.
     */
    gap: number
    /** Thickness in pixels. Default to 16. */
    barThickness: number
    /** Length of the bar in pixels. Default to 256. */
    barLength: number
    /** Determines the absolute minimum line width (border and tick size) */
    minLineWidth: number
    /**
     * Padding expressed in pixels and following the CSS convention.
     * Default to 0.
     */
    padding:
        | number
        | [vertical: number, horizontal: number]
        | [top: number, right: number, bottom: number, left: number]
}

export function ensureColorRampCanvasPainterInterface(
    data: unknown
): ColorRampCanvasPainterInterface {
    if (data instanceof ColorRampCanvasPainterInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type ColorRampCanvasPainterInterface!")
}

export default abstract class ColorRampCanvasPainterInterface {
    /**
     * Resize and repaint a canvas to display a colorRamp.
     * @param preferedWidth Due to the human friendly valud displayed
     * the actual size will be near to `preferedWidth`, but almost
     * never strictly equal.
     * @param micrometersPerPixel Size of a pixel in micrometers.
     */
    abstract paint(
        canvas: HTMLCanvasElement,
        options: Partial<ColorRampCanvasPainterOptions> & {
            transferFunction: BraynsApiTransferFunction
        }
    ): void

    /**
     * @returns The options with all the default values set.
     */
    abstract completeDefaultValues(
        options: Partial<ColorRampCanvasPainterOptions> & {
            transferFunction: BraynsApiTransferFunction
        }
    ): ColorRampCanvasPainterOptions
}
