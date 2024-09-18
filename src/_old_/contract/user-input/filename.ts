import { ModalManagerInterface } from "../manager/modal"

export interface FilenameUserInputOptions {
    /**
     * Title to display to the user to help him know what they are selecting a file for.
     */
    title: string
    /**
     * When this function is provided, the user will be able to select
     * only filenames this function returns true for.
     * @param filename Absolute path of the filename.
     */
    filter?(this: void, filename: string): boolean
    /**
     * Previously visited folders are remembered.
     * You can give a specific key to store a specific type of folder.
     */
    storageKey?: string
}

/**
 * Ask the user to provide a filename (with full path),
 * or `null` if they cancelled it.
 */
export type FilenameUserInputFunction = (
    options: FilenameUserInputOptions,
    modal: ModalManagerInterface
) => Promise<string | null>

export function ensureFilenameUserInputInterface(
    data: unknown
): FilenameUserInputInterface {
    if (data instanceof FilenameUserInputInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type FilenameUserInputInterface!")
}

export abstract class FilenameUserInputInterface {
    abstract readonly ask: FilenameUserInputFunction
}
