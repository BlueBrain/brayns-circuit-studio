import { humanFriendlySort } from "@/_old_/tool/name-splitter/name-splitter"

const DIRECTORY_SEPARATOR = "/"

export interface DirItem {
    path: string
    label: string
    indentation: number
}

/**
 * We want to transform this:
 *
 * ```
 * /media/video/mice
 * /media/video/rats
 * /media/img/dogs
 * /media/img/cats
 * /home/henry/presentations
 * ```
 *
 * into this:
 *
 * ```
 * /
 *   home/
 *     henry/
 *       presentations/
 *   media/
 *     img/
 *       cats/
 *       dogs/
 *     video/
 *       mice/
 *       rats/
 * ```
 */
export function getTreeFromDirList(directories: string[]): DirItem[] {
    const set = new Set<string>()
    set.add("/")
    for (const path of humanFriendlySort(directories)) {
        const pieces = splitIntoPieces(path)
        if (pieces.length < 1) continue

        for (let index = 1; index <= pieces.length; index++) {
            const subPath = pieces.slice(0, index).join(DIRECTORY_SEPARATOR)
            set.add(`${DIRECTORY_SEPARATOR}${subPath}${DIRECTORY_SEPARATOR}`)
        }
    }
    const fullList = Array.from(set)
    const items: DirItem[] = []
    for (const path of fullList) {
        const pieces = splitIntoPieces(path)
        const label = getLastPiece(pieces)
        items.push({
            path,
            label,
            indentation: pieces.length,
        })
    }
    return items
}

function getLastPiece(pieces: string[]): string {
    if (pieces.length === 0) return DIRECTORY_SEPARATOR

    const last = pieces[pieces.length - 1]
    return `${last}${DIRECTORY_SEPARATOR}`
}

function splitIntoPieces(path: string): string[] {
    const sanitizedPath = removeTrailingSlash(path)
    if (sanitizedPath.length === 0) return []
    return sanitizedPath.split(DIRECTORY_SEPARATOR).filter((p) => p.length > 0)
}

function removeTrailingSlash(path: string): string {
    const trimmedPath = path.trim()
    if (trimmedPath.endsWith(DIRECTORY_SEPARATOR)) {
        return trimmedPath.substring(0, trimmedPath.length - 1)
    }
    return trimmedPath
}
