import CalcInterface from "@/_old_/contract/tool/calc"
import CameraManagerInterface from "@/_old_/contract/manager/camera"
import GesturesWatcher, { GesturesWatcherEvent } from "./gestures-watcher"

export default class TranslateWatcher {
    private lastPointerX = 0
    private lastPointerY = 0

    constructor(
        private readonly calc: CalcInterface,
        private readonly cameraManager: CameraManagerInterface,
        private readonly gesturesWatcher: GesturesWatcher
    ) {
        gesturesWatcher.onDown.add(this.handleDown)
        gesturesWatcher.onDrag.add(this.handleDrag)
    }

    detach() {
        const { gesturesWatcher } = this
        gesturesWatcher.onDown.remove(this.handleDown)
        gesturesWatcher.onDrag.remove(this.handleDrag)
    }

    private readonly handleDown = (evt: GesturesWatcherEvent) => {
        this.lastPointerX = evt.x
        this.lastPointerY = evt.y
    }

    private readonly handleDrag = (evt: GesturesWatcherEvent) => {
        if (!GesturesWatcher.isRightButtonPressed(evt)) return

        const { x, y } = evt
        const deltaX = x - this.lastPointerX
        const deltaY = y - this.lastPointerY
        this.lastPointerX = x
        this.lastPointerY = y
        const { cameraManager, calc } = this
        const cameraHeight = cameraManager.getHeightAtTarget()
        const axis = calc.getAxisFromQuaternion(
            cameraManager.params.orientation
        )
        const { target } = cameraManager.params
        if (evt.ctrlKey) {
            cameraManager.updateParams({
                target: calc.addVectors(
                    target,
                    calc.scaleVector(axis.z, -deltaY * cameraHeight)
                ),
            })
        } else {
            cameraManager.updateParams({
                target: calc.addVectors(
                    target,
                    calc.scaleVector(axis.x, -deltaX * cameraHeight),
                    calc.scaleVector(axis.y, -deltaY * cameraHeight)
                ),
            })
        }
    }
}
