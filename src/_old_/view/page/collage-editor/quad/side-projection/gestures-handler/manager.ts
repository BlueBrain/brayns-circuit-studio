import GesturesWatcher, { GesturesWatcherEvent } from "../../gestures-watcher"
import SidePainter from "../../../painter/side"
import SlicesContainer from "../../../slices-container"
import { Axis, Quaternion, Vector2, Vector3 } from "@/_old_/contract/tool/calc"
import { cloneBezierSliceControlPoint, findItemForSmallestValue } from "./tools"
import { EMPTY_FUNCTION } from "@/_old_/constants"
import { SlicesBezierCurveControlPoint } from "@/_old_/contract/feature/morphology-collage"

const EPSILON = 1e-6

export default class GesturesManager {
    /**
     * Last position of the pointer.
     * Used for camera translation with right mouse button.
     */
    private lastPointerX = 0
    private lastPointerY = 0
    private cameraAxis: Axis = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }
    private initialPointInCamSpace: Vector2 = [0, 0]
    private sliceCenterInCamSpace: Vector2 = [0, 0]
    private initialSliceOrientation: Quaternion = [0, 0, 0, 1]
    /**
     * Length of the handle in world space
     * divided by its length in camera space.
     */
    private selectedTipLengthFactor = 1
    private tipUnitVectorInCamSpace: Vector2 = [1, 0]
    /**
     * This function depends on what we have selected: slice or tip.
     */
    private moveHandler: (cameraPoint: Vector2) => void = EMPTY_FUNCTION
    private selectedSlicePoint: SlicesBezierCurveControlPoint = {
        center: [0, 0, 0],
        type: "start",
        handleLength: 0,
        orientation: [0, 0, 0, 1],
    }
    private pointStart = this.selectedSlicePoint
    private pointEnd = this.selectedSlicePoint

    constructor(
        private readonly painter: SidePainter,
        private readonly slicesContainer: SlicesContainer,
        private readonly onPointChange: (
            point: SlicesBezierCurveControlPoint
        ) => void,
        private readonly onCameraTranslate: (
            translateX: number,
            translateY: number
        ) => void
    ) {}

    public handlePointerMove(evt: GesturesWatcherEvent) {
        if (GesturesWatcher.isRightButtonPressed(evt)) {
            this.translateCamera(evt.x, evt.y)
        } else {
            const { painter } = this
            const cameraHeight = painter.cameraManager.getHeightAtTarget()
            const pointE: Vector2 = [evt.x * cameraHeight, evt.y * cameraHeight]
            this.moveHandler(pointE)
        }
    }

    /**
     * User pressed the right mouse button to translate the camera.
     */
    translateCamera(x: number, y: number) {
        const { painter } = this
        const deltaX = x - this.lastPointerX
        const deltaY = y - this.lastPointerY
        this.lastPointerX = x
        this.lastPointerY = y
        const cameraHeight = painter.cameraManager.getHeightAtTarget()
        this.onCameraTranslate(deltaX * cameraHeight, deltaY * cameraHeight)
    }

    public handlePointerDown(
        evt: GesturesWatcherEvent,
        cameraOrientation: Quaternion
    ) {
        if (GesturesWatcher.isRightButtonPressed(evt)) {
            this.lastPointerX = evt.x
            this.lastPointerY = evt.y
            return
        }
        const { painter } = this
        const { calc } = painter
        const slicesDef = this.slicesContainer.bezier
        this.pointStart = cloneBezierSliceControlPoint(slicesDef.pointStart)
        this.pointEnd = cloneBezierSliceControlPoint(slicesDef.pointEnd)
        const cameraHeight = painter.cameraManager.getHeightAtTarget()
        const pointE: Vector2 = [evt.x * cameraHeight, evt.y * cameraHeight]
        this.initialPointInCamSpace = pointE
        const cameraAxis = calc.getAxisFromQuaternion(cameraOrientation)
        this.cameraAxis = cameraAxis
        const cameraTarget = painter.cameraManager.params.target
        const pointA = this.projectPointOnCameraSpace(
            slicesDef.pointStart.center,
            cameraTarget,
            cameraAxis
        )
        const pointB = this.projectPointOnCameraSpace(
            slicesDef.pointEnd.center,
            cameraTarget,
            cameraAxis
        )
        const tipA = this.projectPointOnCameraSpace(
            this.computeTip(slicesDef.pointStart),
            cameraTarget,
            cameraAxis
        )
        const tipB = this.projectPointOnCameraSpace(
            this.computeTip(slicesDef.pointEnd),
            cameraTarget,
            cameraAxis
        )
        const callback = findItemForSmallestValue(
            [
                [pointA, this.handleDownForPointA],
                [pointB, this.handleDownForPointB],
                [tipA, this.handleDownForTipA],
                [tipB, this.handleDownForTipB],
            ].map(([point, callback]: [Vector2, () => void]) => [
                calc.distance(point, pointE),
                callback,
            ])
        )
        callback()
    }

    /**
     * Moving the tip will do two things:
     * 1. Changing the handle length.
     * 2. Rotating the slice around the camera's Z axis.
     * @param pointInCamSpace The point the mouse is moving (expressed in camera space).
     */
    private readonly moveTip = (pointInCamSpace: Vector2) => {
        const {
            cameraAxis,
            initialSliceOrientation,
            painter,
            selectedSlicePoint,
            selectedTipLengthFactor,
            sliceCenterInCamSpace,
            tipUnitVectorInCamSpace,
        } = this
        const { calc } = painter
        const newTipVector = calc.subVectors(
            pointInCamSpace,
            sliceCenterInCamSpace
        )
        const newTipLength = calc.length(newTipVector)
        if (newTipLength < EPSILON) return

        selectedSlicePoint.handleLength = newTipLength * selectedTipLengthFactor
        const newTipUnitVector = calc.normalizeVector(newTipVector)
        const angle = getAngleBetweenUnitVectors(
            tipUnitVectorInCamSpace,
            newTipUnitVector
        )
        selectedSlicePoint.orientation = calc.rotateQuaternionAroundVector(
            initialSliceOrientation,
            cameraAxis.z,
            angle
        )
        this.onPointChange(selectedSlicePoint)
    }

    private readonly movePoint = (pointInCamSpace: Vector2) => {
        const { painter, cameraAxis, selectedSlicePoint } = this
        const { calc } = painter
        const [sx, sy] = calc.subVectors(
            pointInCamSpace,
            this.initialPointInCamSpace
        )
        const direction: Vector3 = calc.addVectors(
            calc.scaleVector(cameraAxis.x, sx),
            calc.scaleVector(cameraAxis.y, sy)
        )
        const point = {
            ...selectedSlicePoint,
            center: calc.addVectors(selectedSlicePoint.center, direction),
        }
        this.onPointChange(point)
    }

    private readonly handleDownForPointA = () => {
        this.selectedSlicePoint = this.pointStart
        this.moveHandler = this.movePoint
    }

    private readonly handleDownForPointB = () => {
        this.selectedSlicePoint = this.pointEnd
        this.moveHandler = this.movePoint
    }

    private readonly handleDownForTipA = () => {
        this.handleDownForTip(this.pointStart)
    }

    private readonly handleDownForTipB = () => {
        this.handleDownForTip(this.pointEnd)
    }

    private handleDownForTip(point: SlicesBezierCurveControlPoint) {
        const { painter } = this
        const { calc } = painter
        const tip = this.computeTip(point)
        const cameraTarget = painter.cameraManager.params.target
        this.sliceCenterInCamSpace = this.projectPointOnCameraSpace(
            point.center,
            cameraTarget,
            this.cameraAxis
        )
        const tipInCamSpace = this.projectPointOnCameraSpace(
            tip,
            cameraTarget,
            this.cameraAxis
        )
        const tipVector = calc.subVectors(
            tipInCamSpace,
            this.sliceCenterInCamSpace
        )
        this.selectedTipLengthFactor =
            point.handleLength / calc.length(tipVector)
        this.tipUnitVectorInCamSpace = calc.normalizeVector(tipVector)

        this.selectedSlicePoint = point
        this.initialSliceOrientation = [...point.orientation]
        this.moveHandler = this.moveTip
    }

    private projectPointOnCameraSpace(
        point: Vector3,
        cameraCenter: Vector3,
        cameraAxis: { x: Vector3; y: Vector3 }
    ): Vector2 {
        const { calc } = this.painter
        const centeredPoint = calc.subVectors(point, cameraCenter)
        return [
            calc.dotProduct(centeredPoint, cameraAxis.x),
            calc.dotProduct(centeredPoint, cameraAxis.y),
        ]
    }

    private computeTip(point: SlicesBezierCurveControlPoint): Vector3 {
        const { calc } = this.painter
        const axis = calc.getAxisFromQuaternion(point.orientation)
        return calc.addVectors(
            point.center,
            calc.scaleVector(
                axis.z,
                point.type === "start"
                    ? -point.handleLength
                    : +point.handleLength
            )
        )
    }
}

function getAngleBetweenUnitVectors(vecI: Vector2, vecM: Vector2) {
    const [xI, yI] = vecI
    const xJ = -yI
    const yJ = xI
    const [xM, yM] = vecM
    const x = xI * xM + yI * yM
    const y = xJ * xM + yJ * yM
    return Math.atan2(y, x)
}
