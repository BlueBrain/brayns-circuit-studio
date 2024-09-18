import { half } from "@/_old_/constants"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import CalcInterface, { Quaternion } from "@/_old_/contract/tool/calc"
import Icon from "@/_old_/ui/view/icon"
import * as React from "react"
import Button from "@/_old_/ui/view/button"
import "./axis-gizmo-view.css"
import Painter from "./painter"

const GIZMO_SIZE = 128

export interface AxisGizmoViewProps {
    className?: string
    camera: CameraModuleInterface
    calc: CalcInterface
}

export default function AxisGizmoView(props: AxisGizmoViewProps) {
    const refCanvas = React.useRef<null | HTMLCanvasElement>(null)
    React.useEffect((): (() => void) | void => {
        const canvas = refCanvas.current
        if (!canvas) {
            console.error("Reference is null!")
            return
        }

        try {
            return initCanvas(canvas, props)
        } catch (ex) {
            console.error("Unable to initialize Canvas for Axis Gizmo:", ex)
        }
    }, [props, refCanvas.current])
    const rotate = React.useCallback(
        (direction: number) => {
            const { orientation } = props.camera.params
            const axis = props.calc.getAxisFromQuaternion(orientation)
            props.camera.updateParams({
                orientation: props.calc.rotateQuaternionAroundVector(
                    orientation,
                    axis.z,
                    -direction * half(Math.PI)
                ),
            })
        },
        [props.calc, props.camera]
    )
    return (
        <div className={getClassNames(props)}>
            <canvas
                ref={refCanvas}
                width={GIZMO_SIZE}
                height={GIZMO_SIZE}
            ></canvas>
            <Icon
                className="icon left"
                name="turn-left"
                onClick={() => rotate(+1)}
            />
            <Icon
                className="icon right"
                name="turn-right"
                onClick={() => rotate(-1)}
            />
            <Button
                className="reset-button"
                label="Reset"
                onClick={() => {
                    props.camera.reset()
                }}
            />
        </div>
    )
}

function getClassNames(props: AxisGizmoViewProps): string {
    const classNames = ["custom", "view-scene-AxisGizmoView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

const TWO = 2
const RADIUS = half(Math.sqrt(TWO))
const ORIENTATIONS: { [key: string]: Quaternion } = {
    "X+": [0, RADIUS, 0, RADIUS],
    "X-": [0, RADIUS, 0, -RADIUS],
    "Y+": [-RADIUS, 0, 0, RADIUS],
    "Y-": [-RADIUS, 0, 0, -RADIUS],
    "Z+": [0, 0, 0, 1],
    "Z-": [0, 1, 0, 0],
}
const BACK: { [name: string]: string } = {
    "X+": "X-",
    "X-": "X+",
    "Y+": "Y-",
    "Y-": "Y+",
    "Z+": "Z-",
    "Z-": "Z+",
}

function initCanvas(
    canvas: HTMLCanvasElement,
    props: AxisGizmoViewProps
): () => void {
    const painter = new Painter(canvas)
    const { camera } = props
    const handleClick = makeTipClickHandler(camera)
    const actualPaint = () => {
        painter.updateCamera(camera.params.orientation)
        painter.paint()
    }
    let id = 0
    const paint = () => {
        window.cancelAnimationFrame(id)
        id = window.requestAnimationFrame(actualPaint)
    }
    props.camera.eventChange.add(paint)
    const observer = new ResizeObserver(paint)
    observer.observe(canvas)
    painter.eventTipClick.add(handleClick)
    paint()
    // Return the function to use to detach from the canvas.
    return () => {
        props.camera.eventChange.remove(paint)
        observer.unobserve(canvas)
        painter.eventTipClick.remove(handleClick)
    }
}

function makeTipClickHandler(cameraManager: CameraModuleInterface) {
    return (name: string) => {
        const orientation = ORIENTATIONS[name]
        if (!orientation) return

        const [x1, y1, z1, w1] = cameraManager.params.orientation
        const [x2, y2, z2, w2] = orientation
        const x = x1 - x2
        const y = y1 - y2
        const z = z1 - z2
        const w = w1 - w2
        const dist = x * x + y * y + z * z + w * w
        if (dist < 1e-6) {
            const backOrientation = ORIENTATIONS[BACK[name]]
            if (backOrientation) {
                cameraManager.updateParams({ orientation: backOrientation })
            }
            return
        }
        cameraManager.updateParams({ orientation })
    }
}
