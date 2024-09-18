import GenericEvent from "@/_old_/tool/event"

export interface PythonScriptMakerFeatureOptions {
    destinationFolder: string
    account: string
    width: number
    height: number
}

export function ensurePythonScriptMakerFeatureInterface(
    data: unknown
): PythonScriptMakerFeatureInterface {
    if (data instanceof PythonScriptMakerFeatureInterface) return data

    console.error("Expected PythonScriptMakerFeatureInterface but got:", data)
    throw Error("Service is not of type PythonScriptMakerFeatureInterface!")
}

export default abstract class PythonScriptMakerFeatureInterface {
    /**
     * Ask the user for a destination a folder and store all the files
     * needed to generate the requested movie on BB5.
     * @returns `false` if the action as been cancelled by user.
     */
    abstract generatePythonScripts(
        options: PythonScriptMakerFeatureOptions
    ): Promise<boolean>

    abstract eventProgress: GenericEvent<string>
}
