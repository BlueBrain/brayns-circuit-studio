import CalcInterface, { Axis, Vector3 } from "@/_old_/contract/tool/calc"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import TransfoGestureWatcherInterface, {
    TranslationEvent,
} from "@/_old_/contract/watcher/transfo-gesture"

export default class CameraManager {
    private initialCameraTarget: Vector3 = [0, 0, 0]
    private initialCameraAxis: Axis = {
        x: [1, 0, 0],
        y: [0, 1, 0],
        z: [0, 0, 1],
    }
    private gestureStart = false

    /**
     * Orbiting is constraint to one axis at the time.
     */
    private _horizontallyContraint = false

    constructor(
        readonly calc: CalcInterface,
        readonly cameraManager: CameraModuleInterface,
        readonly transfoGestureWatcher: TransfoGestureWatcherInterface
    ) {
        transfoGestureWatcher.eventTranslateStart.add(this.saveCameraState)
        transfoGestureWatcher.eventTranslate.add(this.handleTranslate)
        transfoGestureWatcher.eventTranslateStop.add(this.handleTranslate)
        transfoGestureWatcher.eventOrbitStart.add(this.saveCameraState)
        transfoGestureWatcher.eventOrbit.add(this.handleOrbit)
        transfoGestureWatcher.eventOrbitStop.add(this.handleOrbit)
        transfoGestureWatcher.eventZoom.add(this.handleZoom)
    }

    private readonly saveCameraState = () => {
        const camera = this.cameraManager
        this.initialCameraAxis = this.calc.getAxisFromQuaternion(
            camera.params.orientation
        )
        this.initialCameraTarget = [...camera.params.target]
        this.gestureStart = true
    }

    private readonly handleTranslate = (evt: TranslationEvent) => {
        console.log("🚀 [camera-transfo-updater] evt = ", evt) // @FIXME: Remove this line written on 2024-02-26 at 14:23
        const camera = this.cameraManager
        const calc = this.calc
        if (camera.params.type === "orthographic") {
            const scale = camera.params.height / camera.viewport.height
            const axis = calc.getAxisFromQuaternion(camera.params.orientation)
            const directionX = calc.scaleVector(axis.x, -scale * evt.x)
            const directionY = calc.scaleVector(axis.y, scale * evt.y)
            const directionZ = calc.scaleVector(axis.z, scale * evt.z)
            camera.updateParams({
                target: calc.addVectors(
                    this.initialCameraTarget,
                    directionX,
                    directionY,
                    directionZ
                ),
            })
        } else {
            // Perspective.
            // @TODO: Implement translation in perspective projection.
            return
        }
    }

    private readonly handleOrbit = (evt: TranslationEvent) => {
        if (this.gestureStart) {
            this.gestureStart = false
            this._horizontallyContraint = Math.abs(evt.x) >= Math.abs(evt.y)
        }
        const SCALE = 0.005
        if (this._horizontallyContraint) {
            this.orbitAroundY(-evt.x * SCALE)
        } else {
            this.orbitAroundX(-evt.y * SCALE)
        }
    }

    private orbitAroundX(angle: number) {
        const calc = this.calc
        const { x, y, z } = this.initialCameraAxis
        const axis = {
            x,
            y: calc.rotateVectorAroundVector(y, x, angle),
            z: calc.rotateVectorAroundVector(z, x, angle),
        }
        this.cameraManager.updateParams({
            orientation: calc.getQuaternionFromAxis(axis),
        })
    }

    private orbitAroundY(angle: number) {
        const calc = this.calc
        const { x, y, z } = this.initialCameraAxis
        const axis = {
            x: calc.rotateVectorAroundVector(x, y, angle),
            y,
            z: calc.rotateVectorAroundVector(z, y, angle),
        }
        this.cameraManager.updateParams({
            orientation: calc.getQuaternionFromAxis(axis),
        })
    }

    private readonly handleZoom = (delta: number) => {
        const camera = this.cameraManager
        const FACTOR = 0.05
        const scale = 1 + Math.abs(delta) * FACTOR
        const cameraParams = camera.params
        if (cameraParams.type === "orthographic") {
            camera.params = {
                ...cameraParams,
                height:
                    delta > 0
                        ? cameraParams.height * scale
                        : cameraParams.height / scale,
            }
        } else {
            // Perspective.
            camera.params = {
                ...cameraParams,
                distance:
                    cameraParams.distance * (delta > 0 ? scale : 1 / scale),
            }
        }
    }

    set element(element: HTMLElement | SVGElement | undefined) {
        this.transfoGestureWatcher.element = element
    }

    get element() {
        return this.transfoGestureWatcher.element
    }
}
