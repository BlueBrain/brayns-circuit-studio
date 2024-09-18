import { half, RADIANS_PER_DEGREE } from "@/_old_/constants"
import CameraManagerInterface from "@/_old_/contract/manager/camera"
import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api"
import { BraynsApiCameraSettings } from "@/_old_/contract/service/brayns-api/camera"
import CalcInterface, { Quaternion, Vector3 } from "@/_old_/contract/tool/calc"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"
import CameraUpdater from "./camera-updater"

export default class CameraManager implements CameraManagerInterface {
    public readonly eventChange: TriggerableEventInterface<CameraManagerInterface>

    private _params: BraynsApiCameraSettings = {
        type: "orthographic",
        distance: 13149.997,
        target: [6587.5015, 3849.2866, 5687.4893],
        orientation: [0.0, 0.707107, 0.0, 0.707107],
        height: 1000,
    }
    private _initialized = false
    private readonly updater: CameraUpdater
    private _viewport: { width: number; height: number } = {
        width: 1,
        height: 1,
    }

    constructor(
        private readonly brayns: BraynsApiServiceInterface,
        private readonly calc: CalcInterface,
        imageStream: ImageStreamInterface,
        makeEvent: <T>() => TriggerableEventInterface<T>
    ) {
        this.eventChange = makeEvent()
        this.updater = new CameraUpdater(brayns, calc, imageStream)
    }

    triggerChangeEvent(): void {
        this.eventChange.trigger(this)
    }

    reset() {
        this.params = {
            type: "orthographic",
            distance: 13149.997,
            target: [6587.5015, 3849.2866, 5687.4893],
            orientation: [0.707107, 0.0, -0.707107, 0],
            height: 10000,
        }
    }

    updateParams(
        update: Partial<{
            target: Vector3
            distance: number
            orientation: Quaternion
        }>
    ) {
        this.params = {
            ...this.params,
            ...update,
        }
    }

    async updateNow() {
        await this.updater.actualUpdate()
    }

    get params(): BraynsApiCameraSettings {
        return cloneCameraSettings(this._params)
    }

    set params(value: BraynsApiCameraSettings) {
        this._params = cloneCameraSettings(value)
        this.triggerChangeEvent()
        void this.updater.update(this._params, this._viewport)
    }

    /**
     * @returns Height of the visible part of the plan perpendicular to camera Z axis
     * and containing point at target.
     */
    getHeightAtTarget(): number {
        if (this._params.type === "orthographic") {
            return this._params.height
        }
        const angle = half(this._params.fovy * RADIANS_PER_DEGREE)
        return this._params.distance * Math.tan(angle)
    }

    setHeightAtTarget(height: number): void {
        if (this._params.type === "orthographic") {
            if (this._params.height !== height) {
                this._params.height = height
                this._params.distance = height * 10
                this.triggerChangeEvent()
                void this.updater.update(this._params, this._viewport)
            }
            return
        }
        throw Error(
            "[CameraManager.setHeightAtTarget] Perspective camera has not been implemented yet!"
        )
    }

    async initialize() {
        if (this._initialized) return

        this._params = await this.brayns.camera.get()
        this.triggerChangeEvent()
        this._initialized = true
    }

    hasOrthographicProjection(): boolean {
        return this.params.type === "orthographic"
    }

    /** Position can only be read. */
    get position() {
        const calc = this.calc
        const axis = calc.getAxisFromQuaternion(this._params.orientation)
        return calc.addVectors(
            this._params.target,
            calc.scaleVector(axis.z, this._params.distance)
        )
    }

    get viewport() {
        return { ...this._viewport }
    }
    set viewport(value: { width: number; height: number }) {
        this._viewport = {
            width: Math.ceil(value.width),
            height: Math.ceil(value.height),
        }
        this.updateParams({})
    }
}

function cloneCameraSettings(
    camera: BraynsApiCameraSettings
): BraynsApiCameraSettings {
    const { distance } = camera
    const target = [...camera.target] as Vector3
    const orientation = [...camera.orientation] as Quaternion
    if (camera.type === "orthographic") {
        return {
            type: "orthographic",
            distance,
            target,
            orientation,
            height: camera.height,
        }
    }
    return {
        type: "perspective",
        distance,
        target,
        orientation,
        fovy: camera.fovy,
    }
}
