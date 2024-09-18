import CalcInterface from "@/_old_/contract/tool/calc"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import SceneProvider from "./scene-provider"
import { half } from "@/_old_/constants"
import { Slices } from "@/_old_/contract/feature/morphology-collage"
import {
    OrthographicCamera as ThreeOrthographicCamera,
    WebGLRenderer as ThreeWebGLRenderer,
    Quaternion as ThreeQuaternion,
} from "three"

/**
 * Paint a 3D scene on a canvas.
 * The canvas and camera are watched, and repaints are triggered if needed.
 */
export default class ScenePainter {
    private _canvas: HTMLCanvasElement | null = null
    private renderer = new ThreeWebGLRenderer({
        canvas: document.createElement("canvas"),
    })
    private readonly resizeObserver: ResizeObserver
    private readonly sceneProvider: SceneProvider
    private readonly camera = new ThreeOrthographicCamera()
    /**
     * Paintings are usually triggered by a call to `paint()` method.
     * But if the view's size changes, we need to repaint the canvas.
     * This attributes hold the BezierSlicesDef used in the last
     * call of `paint()` and it will be used for resize paints.
     */
    private lastPaintedSlices: Slices | null = null

    constructor(
        private readonly calc: CalcInterface,
        private readonly cameraManager: CameraModuleInterface
    ) {
        this.sceneProvider = new SceneProvider()
        this.resizeObserver = new ResizeObserver(this.repaint)
        this.cameraManager.eventChange.add(this.repaint)
    }

    /**
     * The same scene can be displayed on different canvases
     * from different cameras.
     */
    set canvas(canvas: HTMLCanvasElement | null) {
        this.unregisterCanvas()
        if (canvas) this.registerCanvas(canvas)
        this.repaint()
    }
    get canvas() {
        return this._canvas
    }

    private registerCanvas(canvas: HTMLCanvasElement) {
        this.resizeObserver.observe(canvas)
        this.renderer = new ThreeWebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
        })
        this._canvas = canvas
    }

    private unregisterCanvas() {
        const { _canvas } = this
        if (!_canvas) return

        this.resizeObserver.unobserve(_canvas)
        this._canvas = null
    }

    readonly paint = (slices: Slices) => {
        this.lastPaintedSlices = slices
        this.repaint()
    }

    private readonly repaint = () => {
        window.requestAnimationFrame(() => {
            const slices = this.lastPaintedSlices
            if (!slices) return

            this.sceneProvider.updateScene(slices)
            const { sceneProvider, camera, renderer } = this
            const { scene } = sceneProvider
            this.resetCamera()
            renderer.render(scene, camera)
        })
    }

    private readonly resetCamera = () => {
        const { calc, canvas, renderer, camera, cameraManager } = this
        if (!canvas) return

        const cameraHeight = cameraManager.getHeightAtTarget()
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
        const ratio = canvas.clientWidth / canvas.clientHeight
        const cameraWidth = cameraHeight * ratio
        camera.near = 0.001
        camera.far = cameraHeight * 2e3
        camera.left = -half(cameraWidth)
        camera.right = +half(cameraWidth)
        camera.bottom = -half(cameraHeight)
        camera.top = +half(cameraHeight)
        const quaternion = cameraManager.params.orientation
        camera.rotation.setFromQuaternion(new ThreeQuaternion(...quaternion))
        const axis = calc.getAxisFromQuaternion(quaternion)
        const distance = cameraHeight * 1e3
        const cameraPosition = calc.addVectors(
            this.cameraManager.params.target,
            calc.scaleVector(axis.z, distance)
        )
        camera.position.set(...cameraPosition)
        camera.updateProjectionMatrix()
    }
}
