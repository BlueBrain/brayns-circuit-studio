export default abstract class FileSaverInterface {
    /**
     * @param canvas The canvas holding the image we want to save.
     * @param filename Must have `*.png`, `*.jpg` or `*.jpeg` extension.
     */
    abstract saveCanvas(
        canvas: HTMLCanvasElement,
        filename: string
    ): Promise<void>

    /**
     * Save an object in JSON format.
     * @param prettyPrint If `true`, the file will be indented for
     * better readability.
     */
    abstract saveJSON(
        object: unknown,
        filename: string,
        prettyPrint: boolean
    ): void

    /**
     * Save a text file locally.
     */
    abstract saveText(content: string, filename: string): void
}

export function ensureFileSaverInterface(data: unknown): FileSaverInterface {
    if (data instanceof FileSaverInterface) return data

    console.error("Expected FileSaverInterface but got:", data)
    throw Error("Service is not of type FileSaverInterface!")
}
