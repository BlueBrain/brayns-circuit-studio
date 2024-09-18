import { Quaternion, Vector3 } from "@/_old_/contract/tool/calc"

export default interface QuickSnapshotManagerInterface {
    /**
     * Take a low res snapshot and paint it on the `canvas`.
     * Then schedule another snapshot in higher quality.
     *
     * Snapshots queries are serialized.
     * If you ask for a new snapshot for a canvas, but the previous
     * one is still waiting in the queue, the new one will overwrite
     * the waiting one.
     *
     * There are two queues: one for low quality and one for high quality.
     * High quality snapshots are only processed when the low quality
     * queue is empty.
     *
     * @param canvas
     * @param cameraHeight
     * @param cameraTarget
     * @param cameraOrientation
     */
    paintSnapshotOnCanvas(
        canvas: HTMLCanvasElement,
        cameraHeight: number,
        cameraTarget: Vector3,
        cameraOrientation: Quaternion
    )
}
