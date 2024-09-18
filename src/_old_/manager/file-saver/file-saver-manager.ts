import FileSaverInterface from "@/_old_/contract/manager/file-saver"
import { getFileExtension } from "@/_old_/tool/filename"
/* eslint-disable class-methods-use-this */

const DEFAULT_GARBAGE_COLLECTOR_DELAY = 60000
const GC_DELAY_FOR_IMAGE = 10000

export default class FileSaver extends FileSaverInterface {
    public saveJSON(
        object: unknown,
        filename: string,
        prettyPrint: boolean
    ): void {
        const content = prettyPrint
            ? JSON.stringify(object, null, "  ")
            : JSON.stringify(object)
        saveFile(
            new File([content], filename, { type: "application/json" }),
            filename
        )
    }

    public saveCanvas(
        canvas: HTMLCanvasElement,
        filename: string
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            canvas.toBlob((blob: Blob) => {
                saveFile(blob, filename, GC_DELAY_FOR_IMAGE)
                resolve()
            }, figureOutTypeFromExtension(filename))
        })
    }

    public saveText(content: string, filename: string): void {
        saveFile(
            new File([content], filename, { type: "application/obj" }),
            filename
        )
    }
}

function figureOutTypeFromExtension(filename: string): string {
    const extension = getFileExtension(filename)
    switch (extension.toLocaleLowerCase()) {
        case "png":
            return "image/png"
        case "jpg":
        case "jpeg":
            return "image/jpeg"
        default:
            throw Error(`Unsupported extension "${extension}"!`)
    }
}

/**
 * Save a file from Blob or object url
 * We achieve this by using the HTML5 download attr of <a>.
 * Check https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#Browser_compatibility
 * for browser compatibility.
 *
 * @param data
 * @param filename
 * @param gcTimeout - When to remove the data uri
 */
function saveFile(
    data: File | Blob | string,
    filename: string,
    garbageCollectorDelay = DEFAULT_GARBAGE_COLLECTOR_DELAY
) {
    const isBlob = data instanceof Blob
    const url = isBlob ? URL.createObjectURL(data) : data

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    const click = new MouseEvent("click")

    // Push the download operation on the next tick
    requestAnimationFrame(() => {
        a.dispatchEvent(click)
    })

    // Revoke the object url later in time
    // when the download of the file is completed (or so we assume).
    if (isBlob) {
        setTimeout(() => {
            URL.revokeObjectURL(url)
        }, garbageCollectorDelay)
    }
}
