import * as React from "react"
import LazySnapshotInterface from "@/_old_/contract/manager/lazy-snapshot"
import SidePainter from "../../painter/side"
import SlicesContainer from "../../slices-container"
import { Quaternion } from "@/_old_/contract/tool/calc"
import { SlicesBezierCurveControlPoint } from "@/_old_/contract/feature/morphology-collage"
import { useGesturesHandler } from "./gestures-handler/hook"
import "./side-projection-view.css"

export interface SideProjectionViewProps {
    className?: string
    painter: SidePainter
    slicesContainer: SlicesContainer
    /**
     * The orientation of the camera in a side projection view
     * is immutable.
     */
    cameraOrientation: Quaternion
    lazySnapshot: LazySnapshotInterface
    onControlPointChange(this: void, point: SlicesBezierCurveControlPoint): void
}

export default function SideProjectionView(props: SideProjectionViewProps) {
    const handleCameraTranslate = useCameraTranslateHandler(props)
    const initGesturesHandler = useGesturesHandler(
        props.painter,
        props.slicesContainer,
        props.cameraOrientation,
        props.onControlPointChange,
        handleCameraTranslate
    )
    const initLazySnapshot = (canvas: HTMLCanvasElement) => {
        let lastCameraHeight = -1
        let lastCameraTargetX = 0
        let lastCameraTargetY = 0
        let lastCameraTargetZ = 0
        const handleTakeLazySnapshot = () => {
            props.lazySnapshot.scheduleSnapshot(canvas, {
                ...props.painter.cameraManager.params,
                orientation: [...props.cameraOrientation],
            })
        }
        handleTakeLazySnapshot()
        props.painter.cameraManager.eventChange.add(() => {
            const [x, y, z] = props.painter.cameraManager.params.target
            const height = props.painter.cameraManager.getHeightAtTarget()
            if (
                height !== lastCameraHeight ||
                x !== lastCameraTargetX ||
                y !== lastCameraTargetY ||
                z !== lastCameraTargetZ
            ) {
                // We refresh only for zooms and translations.
                // Never for rotations, since we are in a fixed
                // side view.
                handleTakeLazySnapshot()
            }
            lastCameraHeight = height
            lastCameraTargetX = x
            lastCameraTargetY = y
            lastCameraTargetZ = z
        })
    }
    return (
        <div className={getClassNames(props)}>
            <canvas ref={initLazySnapshot} className="snapshot"></canvas>
            <canvas ref={initGesturesHandler} className="slices"></canvas>
        </div>
    )
}

function useCameraTranslateHandler(props: SideProjectionViewProps) {
    return React.useCallback(
        (x: number, y: number) => {
            const { painter } = props
            const { calc } = painter
            const axis = calc.getAxisFromQuaternion(props.cameraOrientation)
            const translateX = calc.scaleVector(axis.x, -x)
            const translateY = calc.scaleVector(axis.y, -y)
            painter.cameraManager.updateParams({
                target: calc.addVectors(
                    painter.cameraManager.params.target,
                    translateX,
                    translateY
                ),
            })
        },
        [props.painter]
    )
}

function getClassNames(props: SideProjectionViewProps): string {
    const classNames = [
        "custom",
        "feature-bezierSlices-main-quad-SideProjectionView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
