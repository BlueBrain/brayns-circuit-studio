import { BraynsApiCameraSettings } from "@/_old_/contract/service/brayns-api/camera"
import { OrthographicProjection, PerspectiveProjection } from "./scene"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"

export function ensureLazySnapshotInterface(
    data: unknown
): LazySnapshotInterface {
    if (data instanceof LazySnapshotInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type LazySnapshotInterface!")
}

/**
 * This class is responsible of taking snapshots and display them on given canvases.
 * The first snapshot is always a low res one, and immediatly after a high res one
 * is requested.
 * High res snapshots can be cancelled if a new low one is requested.
 */
export default abstract class LazySnapshotInterface {
    /**
     * Trigger `true` when the low res snapshot starts.
     * Trigger `false` when the low res snapshot is drawn.
     * Never triggered for high res snapshots because they
     * can be cancelled by the need of a new low res one.
     */
    abstract readonly eventBusy: TriggerableEventInterface<boolean>
    /**
     * Take a fast and dirty snapshot and paint a canvas with it.
     * Later, if no other fast snapshot is going on, we take a
     * better one and paint it to the same canvas.
     * High res snapshots can take time, but they are cancelled as
     * soon as a new low res snapshot is requested for the same canvas.
     */
    abstract scheduleSnapshot(
        canvas: HTMLCanvasElement,
        cameraParams: BraynsApiCameraSettings,
        cameraProjection?: OrthographicProjection | PerspectiveProjection
    ): void
}
