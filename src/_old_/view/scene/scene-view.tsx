import * as React from "react"
import GesturesWatcher from "./gestures-handler/gestures-watcher"
import ImageStreamView from "../image-stream/image-stream-view"
import OrbitWatcher from "./gestures-handler/orbit-watcher"
import TranslateWatcher from "./gestures-handler/translate-watcher"
import ZoomWatcher from "./gestures-handler/zoom-watcher"
import { ensureCalcInterface } from "@/_old_/contract/tool/calc"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./scene-view.css"

export interface SceneViewProps {
    className?: string
}

export default function SceneView(props: SceneViewProps) {
    const { calc, scene } = useServiceLocator({
        calc: ensureCalcInterface,
        scene: ensureSceneManagerInterface,
    })
    const { camera } = scene
    const refWatcher = React.useRef(new GesturesWatcher())
    const watcher = refWatcher.current
    const refZoomWatcher = React.useRef(new ZoomWatcher(camera, watcher))
    const refOrbitWatcher = React.useRef(
        new OrbitWatcher(calc, camera, watcher)
    )
    const refTranslateWatcher = React.useRef(
        new TranslateWatcher(calc, camera, watcher)
    )
    const handleCanvasMount = React.useCallback(
        (canvas: HTMLCanvasElement) => {
            refWatcher.current.canvas = canvas
        },
        [scene]
    )
    React.useEffect(() => {
        void scene.imageStream.askForNextFrame()
        return () => {
            refZoomWatcher.current.detach()
            refOrbitWatcher.current.detach()
            refTranslateWatcher.current.detach()
            refWatcher.current.canvas = null
        }
    }, [])
    return (
        <ImageStreamView
            className={getClassNames(props)}
            imageStream={scene.imageStream}
            viewportAutoReset={false}
            onResize={(width, height) =>
                window.requestAnimationFrame(
                    () => (scene.camera.viewport = { width, height })
                )
            }
            onCanvasReady={handleCanvasMount}
        />
    )
}

function getClassNames(props: SceneViewProps): string {
    const classNames = ["custom", "view-SceneView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
