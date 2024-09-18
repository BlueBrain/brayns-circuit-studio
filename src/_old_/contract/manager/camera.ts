import GenericEvent from "@/_old_/contract/tool/event"
import { BraynsApiCameraSettings } from "../service/brayns-api/camera"
import { Quaternion, Vector3 } from "@/_old_/contract/tool/calc"

export default interface CameraModuleInterface {
    params: BraynsApiCameraSettings
    initialize(): Promise<void>
    /**
     * Reset the camera to face a mouse brain.
     */
    reset(): void
    /**
     * Change the params of the camera, but send the info
     * to Brayns later.
     */
    updateParams(
        update: Partial<{
            target: Vector3
            distance: number
            orientation: Quaternion
        }>
    ): void
    /**
     * Wait for the camera update to be actually sent to Brayns.
     */
    updateNow(): Promise<void>
    /**
     * This event is triggered once the camera dta has changed locally,
     * but before the change has been sync with Brayns.
     */
    readonly eventChange: GenericEvent<CameraModuleInterface>
    /**
     * Camera position is deducted from the target, the distance and the orientation.
     * that's hy it's readonly.
     */
    readonly position: Vector3
    /** Camera position is at a distance of `distance` from `target`. */
    viewport: {
        width: number
        height: number
    }
    hasOrthographicProjection(): boolean
    /**
     * @returns Height of the visible part of the plan perpendicular to camera Z axis
     * and containing point at target.
     */
    getHeightAtTarget(): number
    /**
     * @param height Height in micrometers of what an orthographic camera can see vertically.
     */
    setHeightAtTarget(height: number): void
    /**
     * Force the change event to be triggered.
     */
    triggerChangeEvent(): void
}
