import CalcInterface from "@/_old_/contract/tool/calc"
import CameraManagerInterface from "@/_old_/contract/manager/camera"
import GesturesWatcher, { GesturesWatcherEvent } from "./gestures-watcher"
import { IsKeyPressed } from "./keyboard-watcher"
import { ORBIT_SPEED } from "@/_old_/constants"

/**
 * Free orbiting by dragging the mouse and holding the left button.
 * You can hold "X", "Y" or "Z" keys to constraint the orbit around
 * a given axis.
 */
export default class OrbitWatcher {
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
        if (GesturesWatcher.isRightButtonPressed(evt)) return

        const { x, y } = evt
        const angleX = (x - this.lastPointerX) * ORBIT_SPEED
        const angleY = (y - this.lastPointerY) * ORBIT_SPEED
        this.lastPointerX = x
        this.lastPointerY = y
        const { cameraManager, calc } = this
        let { orientation } = cameraManager.params
        const axis = calc.getAxisFromQuaternion(orientation)
        if (IsKeyPressed("z")) {
            orientation = calc.rotateQuaternionAroundVector(
                orientation,
                axis.z,
                angleX
            )
        } else {
            if (!IsKeyPressed("x")) {
                orientation = calc.rotateQuaternionAroundVector(
                    orientation,
                    axis.y,
                    -angleX
                )
            }
            if (!IsKeyPressed("y")) {
                orientation = calc.rotateQuaternionAroundVector(
                    orientation,
                    axis.x,
                    angleY
                )
            }
        }
        cameraManager.updateParams({ orientation })
    }
}
