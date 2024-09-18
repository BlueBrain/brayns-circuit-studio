import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api"
import LazySnapshotInterface from "@/_old_/contract/manager/lazy-snapshot"
import { BraynsApiCameraSettings } from "@/_old_/contract/service/brayns-api/camera"
import { BraynsSnapshotQualityEnum } from "@/_old_/contract/service/brayns-api/snapshot"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"
import {
    OrthographicProjection,
    PerspectiveProjection,
} from "@/_old_/contract/manager/scene"

interface LazySnapshotTask {
    enabled: boolean
    canvas: HTMLCanvasElement
    cameraParams: BraynsApiCameraSettings
    cameraProjection?: OrthographicProjection | PerspectiveProjection
}

/**
 * This class is responsible of taking snapshots and display them on given canvases.
 * The first snapshot is always a low res one, and if no other snapshot is requested
 * in some time, then a high res snapshot is requested.
 * High res snapshots can be cancelled if a new low one is requested.
 */
export default class LazySnapshot extends LazySnapshotInterface {
    public readonly eventBusy: TriggerableEventInterface<boolean>
    private readonly lowResQueue: LazySnapshotTask[] = []
    private readonly highResQueue: LazySnapshotTask[] = []
    /**
     * It is possible to cancel snapshots of high res.
     */
    private readonly slowSnapshotCancellers = new Map<
        HTMLCanvasElement,
        () => void
    >()
    private processing = false

    constructor(
        private readonly brayns: BraynsApiServiceInterface,
        makeEvent: <T>() => TriggerableEventInterface<T>
    ) {
        super()
        this.eventBusy = makeEvent()
    }

    scheduleSnapshot(
        canvas: HTMLCanvasElement,
        cameraParams: BraynsApiCameraSettings,
        cameraProjection?: OrthographicProjection | PerspectiveProjection
    ) {
        if (!canvas) return

        this.cancelPreviousHighResSnapshot(canvas)
        /**
         * We clean the queue from any other task
         * for this canvas in high res.
         */
        for (const task of this.highResQueue) {
            if (task.canvas === canvas) task.enabled = false
        }
        this.addToQueue(
            { canvas, cameraParams, cameraProjection },
            this.lowResQueue
        )
        this.addToQueue(
            { canvas, cameraParams, cameraProjection },
            this.highResQueue
        )
        void this.process()
    }

    /**
     * In a queue we can find only one task per canvas.
     */
    private addToQueue(
        newTask: Omit<LazySnapshotTask, "enabled">,
        queue: LazySnapshotTask[]
    ) {
        for (const task of queue) {
            if (newTask.canvas === task.canvas) {
                task.enabled = true
                task.cameraParams = newTask.cameraParams
                task.cameraProjection = newTask.cameraProjection
                return
            }
        }
        queue.push({ ...newTask, enabled: true })
    }

    /**
     * All snapshot queries are serialized.
     * At every loop, we process all low res snaphots,
     * then only one high res snapshot (if there is at least one).
     */
    private async process() {
        if (this.processing) return

        this.processing = true
        const { lowResQueue, highResQueue } = this
        try {
            while (this.countEnabledTasks() > 0) {
                while (lowResQueue.length > 0) {
                    const lowResTask = lowResQueue.shift()
                    if (!lowResTask || !isEnabled(lowResTask)) continue

                    this.eventBusy.trigger(true)
                    await this.takeSnapshot(
                        lowResTask,
                        BraynsSnapshotQualityEnum.Low
                    )
                    this.eventBusy.trigger(false)
                }
                while (highResQueue.length > 0) {
                    const highResTask = highResQueue.shift()
                    if (!highResTask) break
                    if (!isEnabled(highResTask)) continue

                    this.eventBusy.trigger(true)
                    await this.takeSnapshot(
                        highResTask,
                        BraynsSnapshotQualityEnum.Medium
                    )
                    this.eventBusy.trigger(false)
                    // Only one high res snapshot per loop.
                    break
                }
            }
        } finally {
            this.processing = false
            this.eventBusy.trigger(false)
        }
    }

    private countEnabledTasks() {
        const { lowResQueue, highResQueue } = this
        return (
            lowResQueue.filter(isEnabled).length +
            highResQueue.filter(isEnabled).length
        )
    }

    private async takeSnapshot(
        { canvas, cameraParams, cameraProjection }: LazySnapshotTask,
        quality: BraynsSnapshotQualityEnum
    ) {
        const resolution = quality === BraynsSnapshotQualityEnum.Low ? 0.25 : 1
        const width = Math.round(resolution * canvas.clientWidth)
        const height = Math.round(resolution * canvas.clientHeight)
        const { cancel, promisedImage } =
            await this.brayns.snapshot.takeCancellableImage({
                quality,
                size: [width, height],
                transparent: false,
                camera: cameraParams,
                projection: cameraProjection,
            })
        if (quality === BraynsSnapshotQualityEnum.High) {
            /**
             * High quality snapshots are slow to render.
             * We need to be able to cancel them as soon as
             * a low res snapshot is requested.
             */
            this.slowSnapshotCancellers.set(canvas, cancel)
        }
        const image = await promisedImage
        const ctx = canvas.getContext("2d")
        if (ctx) {
            canvas.width = width
            canvas.height = height
            ctx.clearRect(0, 0, width, height)
            if (image) ctx.drawImage(image, 0, 0, width, height)
        }
    }

    private cancelPreviousHighResSnapshot(canvas: HTMLCanvasElement) {
        const cancel = this.slowSnapshotCancellers.get(canvas)
        if (cancel) cancel()
    }
}

function isEnabled(task: { enabled: boolean }): boolean {
    return task.enabled
}
