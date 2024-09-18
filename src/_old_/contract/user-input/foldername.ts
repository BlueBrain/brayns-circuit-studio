import { ModalManagerInterface } from "../manager/modal"

export interface FoldernameUserInputOptions {
    /**
     * Title to display to the user to help him know what they are selecting a file for.
     */
    title: string
    /**
     * Previously visited folders are remembered.
     * You can give a specific key to store a specific type of folder.
     */
    storageKey?: string
}

/**
 * Ask the user to provide a Foldername (with full path),
 * or `null` if they cancelled it.
 */
export type FoldernameUserInputFunction = (
    options: FoldernameUserInputOptions,
    modal: ModalManagerInterface
) => Promise<string | null>

export function ensureFoldernameUserInputInterface(
    data: unknown
): FoldernameUserInputInterface {
    if (data instanceof FoldernameUserInputInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type FoldernameUserInputInterface!")
}

export abstract class FoldernameUserInputInterface {
    abstract readonly ask: FoldernameUserInputFunction
}
