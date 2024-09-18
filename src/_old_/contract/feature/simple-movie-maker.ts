import { KeyFrame } from "@/_old_/view/page/main/sections/movie/KeyFramesEditor"
import GenericEvent from "../../tool/event"

export interface SimpleMovieMakerFeatureOptions {
    /** Where the script will be saved. */
    destinationFolder: string
    width: number
    height: number
    fps: number
    firstStep: number
    lastStep: number
    /** Movie duration in seconds. */
    duration: number
    reportDuration?: number
    reportRange?: [number, number]
    reportDataUnit?: string
    reportTimeUnit?: string
    reportStepsCount?: number
    reservation: string
    mainModelId: number
    /** BB5 account: "proj3", "proj42", ... */
    account: string
    keyframes: KeyFrame[]
}

export function ensureSimpleMovieMakerFeatureInterface(
    data: unknown
): SimpleMovieMakerFeatureInterface {
    if (data instanceof SimpleMovieMakerFeatureInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type SimpleMovieMakerFeatureInterface!")
}

export default abstract class SimpleMovieMakerFeatureInterface {
    /**
     * Ask the user for a destination a folder and store all the files
     * needed to generate the requested movie on BB5.
     * @returns `false` if the action as been cancelled by user.
     */
    abstract generateMovieScripts(
        options: SimpleMovieMakerFeatureOptions
    ): Promise<boolean>

    abstract eventProgress: GenericEvent<string>
}
