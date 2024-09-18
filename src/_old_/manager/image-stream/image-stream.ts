import { SEC_PER_MS } from "@/_old_/constants"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api"
import ImageStreamInterface, {
    ImageStreamStats,
} from "@/_old_/contract/manager/image-stream"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"

interface Frame {
    timestamp: number
    sizeInBytes: number
}

export default class ImageStream implements ImageStreamInterface {
    public readonly eventNewImage: TriggerableEventInterface<ImageStreamInterface>
    public readonly eventStats: TriggerableEventInterface<ImageStreamStats>
    private readonly eventWaitingForImage: TriggerableEventInterface<boolean>

    /**
     * We don't want to start a **transaction** while there is a pending
     * request for a frame.
     */
    private _waitingForImage = false
    private lastReceivedImage = new Image()
    private transactionDepth = 0
    private _accumulationProgress = 0
    private needAnotherImage = false
    private viewportWidth = 1
    private viewportHeight = 1
    private readonly framesForStats: Frame[] = []
    /**
     * For performance reasons, we don't dispatch a stats event every time we get
     * a new image. We do this only if the current time is beyond `nextTimeWeCanDispatchStats`.
     */
    private nextTimeWeCanDispatchStats = 0
    /**
     * Timestamp of the last stats event dispatch.
     */
    private lastStatsDispatchTime = 0

    constructor(
        private readonly brayns: BraynsApiServiceInterface,
        makeEvent: <T>() => TriggerableEventInterface<T>
    ) {
        this.eventStats = makeEvent()
        this.eventNewImage = makeEvent()
        this.eventWaitingForImage = makeEvent()
        void this.askForNextFrame()
    }

    takeLocalSnapshot(options: {
        width: number
        height: number
    }): HTMLCanvasElement {
        const canvas = document.createElement("canvas")
        canvas.width = options.width
        canvas.height = options.height
        const { image } = this
        const scaleX = options.width / image.width
        const scaleY = options.height / image.height
        const scale = Math.max(scaleX, scaleY)
        const x = (-scale * image.width + options.width) / 2
        const y = (-scale * image.height + options.height) / 2
        const ctx = canvas.getContext("2d")
        if (!ctx) throw Error("Unable to get a 2D context!")

        ctx.drawImage(image, x, y, scale * image.width, scale * image.height)
        return canvas
    }

    get accumulationProgress() {
        return this._accumulationProgress
    }

    async setViewport(width: number, height: number) {
        if (this.viewportWidth === width && this.viewportHeight === height)
            return

        this.viewportWidth = width
        this.viewportHeight = height
        await this.brayns.renderer.set({
            viewPort: [width, height],
        })
    }

    readonly askForNextFrame = async (): Promise<void> => {
        if (this.waitingForImage || this.transactionDepth > 0) {
            this.needAnotherImage = true
            return
        }
        this.needAnotherImage = false
        this.waitingForImage = true
        try {
            const result = await this.brayns.renderer.trigger({
                renderEvenIfNothingHasChanged: false,
                prepareImageWithoutSendingIt: false,
            })
            this._accumulationProgress = result.progress
            if (result.frame) {
                this.image = result.frame
                this.recordFrameStat(result.sizeInBytes)
            }
            if (this.shouldAskForNextAccumulationFrame(result.progress)) {
                // There are other accumulations available,
                // we ask for them after the throttling delay.
                window.setTimeout(() => void this.askForNextFrame())
            }
        } finally {
            this.waitingForImage = false
        }
    }

    /**
     * Prevent Brayns from rendering new images during the execution time of `action()`.
     */
    async transaction<T>(action: () => Promise<T>): Promise<T> {
        this.transactionDepth++
        try {
            await this.waitUntilCurrentRequestIsDone()
            const result = await action()
            return result
        } catch (ex) {
            console.error("Uncaught error during transaction:", ex)
            throw ex
        } finally {
            this.transactionDepth--
            if (this.transactionDepth <= 0) {
                void this.askForNextFrame()
            }
        }
    }

    public get image() {
        return this.lastReceivedImage
    }

    public set image(image: HTMLImageElement) {
        this.lastReceivedImage = image
        this.eventNewImage.trigger(this)
    }

    /**
     * If there are still images from the accumulation,
     * we can still skip them if we are in a transaction.
     */
    private shouldAskForNextAccumulationFrame(progress: number): boolean {
        if (this.needAnotherImage) return true
        if (progress >= 1) return false
        return this.transactionDepth <= 0
    }

    private get waitingForImage() {
        return this._waitingForImage
    }
    private set waitingForImage(value: boolean) {
        this._waitingForImage = value
        this.eventWaitingForImage.trigger(value)
    }

    /**
     * This promise will resolve only when there is no ongoing request
     * to Brayns for the next image.
     */
    private waitUntilCurrentRequestIsDone(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.waitingForImage) {
                resolve()
                return
            }

            const handler = (value: boolean) => {
                this.eventWaitingForImage.remove(handler)
                if (!value) resolve()
            }
            this.eventWaitingForImage.add(handler)
        })
    }

    private recordFrameStat(sizeInBytes: number) {
        const now = Date.now()
        const { framesForStats } = this
        framesForStats.push({ timestamp: now, sizeInBytes })
        if (now > this.nextTimeWeCanDispatchStats) {
            // Let's compute stats.
            if (this.nextTimeWeCanDispatchStats > 0) {
                const elapsedTimeInSecs =
                    (now - this.lastStatsDispatchTime) * SEC_PER_MS
                this.eventStats.trigger({
                    bytesPerSecond:
                        framesForStats.reduce(
                            (previous: number, current: Frame) =>
                                previous + current.sizeInBytes,
                            0
                        ) / elapsedTimeInSecs,
                    framesPerSecond: framesForStats.length / elapsedTimeInSecs,
                })
                this.framesForStats.splice(0, this.framesForStats.length)
            }
            this.nextTimeWeCanDispatchStats = now + 3000
            this.lastStatsDispatchTime = now
        }
    }
}
