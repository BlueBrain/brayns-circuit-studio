import CalcInterface from "@/_old_/contract/tool/calc"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import SceneProvider from "./scene-provider"
import { half } from "@/_old_/constants"
import { SlicesBezierCurve } from "@/_old_/contract/feature/morphology-collage"
import {
    OrthographicCamera as ThreeOrthographicCamera,
    Renderer as ThreeRenderer,
    WebGLRenderer as ThreeWebGLRenderer,
} from "three"

export interface SceneView {
    canvas: HTMLCanvasElement
    camera: ThreeOrthographicCamera
}

interface InternalSceneView extends SceneView {
    renderer: ThreeWebGLRenderer
}

export default class ScenePainter {
    private views: InternalSceneView[] = []
    private readonly resizeObserver: ResizeObserver
    private readonly sceneProvider: SceneProvider
    /**
     * Paintings are usually triggered by a call to `paint()` method.
     * But if the view's size changes, we need to repaint the canvas.
     * This attributes hold the BezierSlicesDef used in the last
     * call of `paint()` and it will be used for resize paints.
     */
    private lastPaintedSlices: SlicesBezierCurve | null = null

    constructor(
        public readonly calc: CalcInterface,
        public readonly cameraManager: CameraModuleInterface
    ) {
        this.sceneProvider = new SceneProvider(calc, cameraManager)
        this.resizeObserver = new ResizeObserver(this.repaint)
        this.cameraManager.eventChange.add(this.repaint)
    }

    /**
     * The same scene can be displayed on different canvases
     * from different cameras.
     */
    registerView(view: SceneView) {
        this.unregisterView(view)
        const { canvas } = view
        this.resizeObserver.observe(canvas)
        this.views.push({
            ...view,
            renderer: new ThreeWebGLRenderer({
                canvas,
                alpha: true,
                antialias: false,
            }),
        })
    }

    unregisterView(view: SceneView) {
        for (const { canvas } of this.views) {
            if (canvas === view.canvas) {
                this.resizeObserver.unobserve(canvas)
            }
        }
        this.views = this.views.filter((item) => item.canvas !== view.canvas)
    }

    readonly paint = (bezier: SlicesBezierCurve) => {
        this.lastPaintedSlices = bezier
        this.repaint()
    }

    private readonly repaint = () => {
        window.requestAnimationFrame(() => {
            const slicesDef = this.lastPaintedSlices
            if (!slicesDef) return

            this.sceneProvider.updateScene(slicesDef)
            const { scene } = this.sceneProvider
            for (const { canvas, camera, renderer } of this.views) {
                this.resetThreeCamera(
                    canvas,
                    camera,
                    this.cameraManager.getHeightAtTarget(),
                    renderer
                )
                renderer.setClearColor(0x000000, 0)
                renderer.render(scene, camera)
            }
        })
    }

    private resetThreeCamera(
        canvas: HTMLCanvasElement,
        camera: ThreeOrthographicCamera,
        cameraHeight: number,
        renderer: ThreeRenderer
    ) {
        const { calc } = this
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
        const { x, y, z } = camera.rotation
        const quaternion = calc.getQuaternionFromEulerAngles({
            roll: x,
            pitch: y,
            yaw: z,
        })
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
