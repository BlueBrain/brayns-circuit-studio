import CameraManagerInterface from "@/_old_/contract/manager/camera"
import GesturesWatcher from "./gestures-watcher"
import { ZOOM_IN, ZOOM_OUT } from "@/_old_/constants"
import { debounce } from "../../../tool/async"

export default class ZoomWatcher {
    constructor(
        private readonly cameraManager: CameraManagerInterface,
        private readonly gesturesWatcher: GesturesWatcher
    ) {
        gesturesWatcher.onZoom.add(this.zoomHandler)
    }

    detach() {
        const { gesturesWatcher } = this
        gesturesWatcher.onZoom.remove(this.zoomHandler)
    }

    private readonly zoomHandler = (evt: { delta: number }) =>
        void this.handleZoom(evt)

    private readonly handleZoom = debounce(({ delta }: { delta: number }) => {
        console.log("🚀 [zoom-watcher] delta = ", delta) // @FIXME: Remove this line written on 2023-11-13 at 10:37
        const { cameraManager } = this
        cameraManager.setHeightAtTarget(
            cameraManager.getHeightAtTarget() * (delta < 0 ? ZOOM_IN : ZOOM_OUT)
        )
    }, 100)
}
