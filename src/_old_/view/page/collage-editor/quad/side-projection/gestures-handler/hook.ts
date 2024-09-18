import * as React from "react"
import GesturesManager from "./manager"
import GesturesWatcher from "../../gestures-watcher"
import SidePainter from "../../../painter/side"
import SlicesContainer from "../../../slices-container"
import { Quaternion } from "@/_old_/contract/tool/calc"
import { SlicesBezierCurveControlPoint } from "@/_old_/contract/feature/morphology-collage"
import { ZOOM_IN, ZOOM_OUT } from "@/_old_/constants"
import {
    OrthographicCamera as ThreeOrthographicCamera,
    Quaternion as ThreeQuaternion,
} from "three"

export function useGesturesHandler(
    painter: SidePainter,
    slicesContainer: SlicesContainer,
    cameraOrientation: Quaternion,
    onPointChange: (point: SlicesBezierCurveControlPoint) => void,
    onCameraTranslate: (x: number, y: number) => void
) {
    const refManager = React.useRef(
        new GesturesManager(
            painter,
            slicesContainer,
            onPointChange,
            onCameraTranslate
        )
    )
    const refCanvasMountedHandler = React.useRef(
        (canvas: HTMLCanvasElement) => {
            if (!canvas) return

            const watcher = new GesturesWatcher()
            watcher.canvas = canvas
            watcher.onDown.add((evt) =>
                refManager.current.handlePointerDown(evt, cameraOrientation)
            )
            watcher.onDrag.add((evt) =>
                refManager.current.handlePointerMove(evt)
            )
            watcher.onZoom.add(({ delta }) => {
                const cameraHeight = painter.cameraManager.getHeightAtTarget()
                painter.cameraManager.setHeightAtTarget(
                    cameraHeight * (delta < 0 ? ZOOM_IN : ZOOM_OUT)
                )
            })
            const camera = new ThreeOrthographicCamera()
            camera.setRotationFromQuaternion(
                new ThreeQuaternion(...cameraOrientation)
            )
            painter.registerView({
                canvas,
                camera,
            })
        }
    )
    return refCanvasMountedHandler.current
}
