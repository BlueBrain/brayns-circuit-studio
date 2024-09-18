import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import SceneManagerInterface from "@/_old_/contract/manager/scene"
import SceneViewManagerInterface from "@/_old_/contract/manager/scene-view"
import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import CalcInterface, { Size } from "@/_old_/contract/tool/calc"
import TransfoGestureWatcherInterface from "@/_old_/contract/watcher/transfo-gesture"
import Async from "@/_old_/tool/async"
import CameraTransfoUpdater from "./camera-transfo-updater"
import SceneCanvasView from "./scene-canvas-view"

const RESET_VIEWPORT_DEBOUNCING_DELAY = 300

export default class SceneViewManager implements SceneViewManagerInterface {
    private readonly cameraTransfoManager: CameraTransfoUpdater

    constructor(
        private readonly jsonRpc: JsonRpcServiceInterface,
        calc: CalcInterface,
        private readonly scene: SceneManagerInterface,
        private readonly transfoGestureWatcher: TransfoGestureWatcherInterface,
        private readonly imageStream: ImageStreamInterface
    ) {
        this.cameraTransfoManager = new CameraTransfoUpdater(
            calc,
            scene.camera,
            transfoGestureWatcher
        )
        /**
         * Double clicking a pixel on the screen will tell us the 3D coords of
         * the hit object, if any.
         */
        const handleDoubleClick = async (x: number, y: number) => {
            try {
                const data = await jsonRpc.exec("inspect", { position: [x, y] })
                // eslint-disable-next-line no-console
                console.info(`Hit test at [${x}, ${y}]:`, data)
            } catch (ex) {
                console.error(`Unable to inpect :`, ex)
            }
        }
        this.view = (
            <SceneCanvasView
                imageStream={imageStream}
                onCanvasReady={this.handleCanvasReady}
                onSizeChange={this.handleSizeChange}
                onDoubleClick={(x: number, y: number) =>
                    void handleDoubleClick(x, y)
                }
            />
        )
    }

    takeLocalSnapshot(): HTMLCanvasElement {
        const { image } = this.imageStream
        const canvas = window.document.createElement("canvas")
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(image, 0, 0)
        return canvas
    }

    getView(): JSX.Element {
        return this.view
    }

    // #################### PRIVATE ####################

    private canvas?: HTMLCanvasElement

    private readonly view: JSX.Element

    private currentCanvasSize: Size = { width: 1920, height: 1080 }

    private readonly handleCanvasReady = (canvas: HTMLCanvasElement) => {
        this.canvas = canvas
        this.transfoGestureWatcher.element = canvas
        this.currentCanvasSize = canvas.getBoundingClientRect()
    }

    private readonly handleSizeChange = (size: Size) => {
        this.currentCanvasSize = size
        void this.handleResetViewport()
    }

    private readonly handleResetViewport = Async.debounce(() => {
        const { width, height } = this.currentCanvasSize
        const { camera } = this.scene
        camera.viewport = { width, height }
        void this.imageStream.setViewport(width, height)
    }, RESET_VIEWPORT_DEBOUNCING_DELAY)
}
