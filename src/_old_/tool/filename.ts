import { NOT_FOUND } from "@/_old_/constants"

/**
 * @returns The extension of a file name.
 * ```
 * getFileExtension("picture.jpg") === "jpg"
 * ```
 */
export function getFileExtension(filename: string) {
    const dotPosition = filename.lastIndexOf(".")
    if (dotPosition === NOT_FOUND) return filename
    return filename.substring(dotPosition + 1)
}

/**
 * @returns A filename without the path.
 * ```
 * getBasename("/home/picwick/cell.png") === "cell.png"
 * ```
 */
export function getBasename(path: string): string {
    const lastSlashPos = path.lastIndexOf("/")
    if (lastSlashPos === NOT_FOUND) return path
    return path.substring(lastSlashPos + 1)
}

/**
 * @returns A filename without its extension.
 * ```
 * removeExtension("foo.txt") === "foo"
 * ```
 */
export function removeExtension(filename: string): string {
    const lastSlashDot = filename.lastIndexOf(".")
    if (lastSlashDot === NOT_FOUND) return filename
    return filename.substring(0, lastSlashDot)
}

export function stripExtension(filename: string): string {
    const pos = filename.lastIndexOf(".")
    if (pos < 0) return filename

    return filename.substring(0, pos)
}

export function joinPath(...pathes: string[]): string {
    const end = pathes.length - 1
    return pathes
        .map((path, index) => {
            if (index > 0 && path.charAt(0) === "/") path = path.substring(1)
            if (index < end && path.endsWith("/"))
                path = path.substring(0, path.length - 1)
            return path
        })
        .join("/")
}
