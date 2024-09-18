import { TriggerableEventInterface } from "@/_old_/contract/tool/event"

export interface ImageStreamStats {
    framesPerSecond: number
    bytesPerSecond: number
}

/**
 * This is the object to use to get the images coming fom Brayns
 * every time the scene is refreshed.
 */
export default interface ImageStreamInterface {
    /**
     * Prevent Brayns from sending new images during the
     * execution of `action()`.
     * Calls of `transaction` can be nested if needed.
     */
    transaction<T>(action: () => Promise<T>): Promise<T>

    /**
     * Ask for the next frame.
     */
    askForNextFrame(): Promise<void>

    /**
     * The view port to use with the next image.
     */
    setViewport(width: number, height: number): Promise<void>

    /**
     * Triggered every time a new image is sent by Brayns.
     */
    readonly eventNewImage: TriggerableEventInterface<ImageStreamInterface>

    /**
     * Dispatch statistics about the number of frames received and the size of them.
     */
    readonly eventStats: TriggerableEventInterface<ImageStreamStats>

    /**
     * The last image received from Brayns.
     */
    readonly image: HTMLImageElement

    /**
     * Take a snapshot of what is actually displayed on the browser's screen.
     */
    takeLocalSnapshot(options: {
        width: number
        height: number
    }): HTMLCanvasElement

    /**
     * Number between 0 and 1 expressing the percentage of
     * the accumulation process. For instance, if Brayns has
     * rendered 12 frames on 15 so far, then the progression
     * is 80%.
     */
    readonly accumulationProgress: number
}
