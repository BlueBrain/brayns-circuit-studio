export interface ScalebarCanvasPainterOptions {
    /** Background fill color. Default to "transparent". */
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
    /** Color of the scalebar line. Default to "white". */
    lineColor: string
    /** Thickness in pixels. Default to 2. */
    lineThickness: number
    /**
     * Padding expressed in pixels and following the CSS convention.
     */
    padding:
        | number
        | [vertical: number, horizontal: number]
        | [top: number, right: number, bottom: number, left: number]
    /**
     * Style of the scalebar tips:
     * * __none__: do not display any tip
     * * __default__: perpendicular tips making the scalebar looking like
     * a very wide H (`|-----|`).
     */
    tipsStyle: "none" | "default"
    /** Tips size expressed in pixels. Default to half of the fontSize. */
    tipsSize: number
}

export function ensureScalebarCanvasPainterInterface(
    data: unknown
): ScalebarCanvasPainterInterface {
    if (data instanceof ScalebarCanvasPainterInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type ScalebarCanvasPainterInterface!")
}

export default abstract class ScalebarCanvasPainterInterface {
    /**
     * Resize and repaint a canvas to display a scalebar.
     * @param preferedWidth Due to the human friendly valud displayed
     * the actual size will be near to `preferedWidth`, but almost
     * never strictly equal.
     * @param micrometersPerPixel Size of a pixel in micrometers.
     */
    abstract paint(
        canvas: HTMLCanvasElement,
        preferedWidth: number,
        micrometersPerPixel: number,
        options?: Partial<ScalebarCanvasPainterOptions>
    ): void
}
