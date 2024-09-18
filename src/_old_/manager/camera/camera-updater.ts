import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api"
import CalcInterface from "@/_old_/contract/tool/calc"
import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import { BraynsApiCameraSettings } from "@/_old_/contract/service/brayns-api/camera"

interface Viewport {
    width: number
    height: number
}

/**
 * Brayns' camera is updated by this class.
 * It is responsible of queuing the camera updates.
 */
export default class CameraUpdater {
    private nextParamsToApply: BraynsApiCameraSettings | null = null
    private nextViewportToApply: Viewport = { width: 1, height: 1 }
    private busy = false
    private lastCameraViewportMessage = ""
    private timeoutIdForDelayedRendererQualityRestoration = 0

    constructor(
        private readonly brayns: BraynsApiServiceInterface,
        private readonly calc: CalcInterface,
        private readonly imageStream: ImageStreamInterface
    ) {}

    async update(cameraSettings: BraynsApiCameraSettings, viewport: Viewport) {
        this.nextParamsToApply = cameraSettings
        this.nextViewportToApply = viewport
        if (!this.busy) await this.actualUpdate()
    }

    async actualUpdate(): Promise<void> {
        const params = this.nextParamsToApply
        if (!params) return

        this.nextParamsToApply = null
        this.busy = true
        try {
            const {
                brayns,
                calc,
                imageStream,
                timeoutIdForDelayedRendererQualityRestoration,
            } = this
            window.clearTimeout(timeoutIdForDelayedRendererQualityRestoration)
            await imageStream.transaction(async () => {
                await brayns.light.clear()
                const axis = calc.getAxisFromQuaternion(params.orientation)
                const keyLight = calc.rotateVectorAroundVector(
                    calc.scaleVector(axis.z, -1),
                    axis.y,
                    Math.PI / 3
                )
                await brayns.light.add({
                    type: "directional",
                    color: [0.8, 0.8, 0.8],
                    intensity: 1,
                    visible: true,
                    direction: keyLight,
                })
                const fillLight = calc.rotateVectorAroundVector(
                    calc.scaleVector(axis.z, -1),
                    axis.y,
                    -Math.PI / 3
                )
                await brayns.light.add({
                    type: "directional",
                    color: [0.2, 0.2, 0.8],
                    intensity: 0.25,
                    visible: true,
                    direction: fillLight,
                })
                await brayns.light.add({
                    type: "ambient",
                    color: [1, 1, 1],
                    intensity: 1.3,
                    visible: true,
                })
                await brayns.camera.set(params)
                await this.actualUpdateCameraViewport(this.nextViewportToApply)
                window.clearTimeout(
                    timeoutIdForDelayedRendererQualityRestoration
                )
                this.timeoutIdForDelayedRendererQualityRestoration =
                    window.setTimeout(
                        () => void imageStream.askForNextFrame(),
                        200
                    )
            })
        } catch (ex) {
            console.error(ex)
        } finally {
            this.busy = false
            if (this.nextParamsToApply) void this.actualUpdate()
        }
    }

    private async actualUpdateCameraViewport(viewport: Viewport) {
        const MINIMAL_VIEWPORT_SIZE = 64
        // Brayns will throw an exception if width/height is not an integer
        // or if they are less than 64.
        const width = Math.max(
            MINIMAL_VIEWPORT_SIZE,
            Math.floor(viewport.width)
        )
        const height = Math.max(
            MINIMAL_VIEWPORT_SIZE,
            Math.floor(viewport.height)
        )
        const cameraViewportMessage = JSON.stringify([width, height])
        if (this.lastCameraViewportMessage !== cameraViewportMessage) {
            await this.imageStream.setViewport(width, height)
            this.lastCameraViewportMessage = cameraViewportMessage
        }
    }
}
