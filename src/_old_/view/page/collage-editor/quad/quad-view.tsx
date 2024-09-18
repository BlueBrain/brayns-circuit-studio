import * as React from "react"
import CalcInterface, {
    ensureCalcInterface,
    Quaternion,
} from "@/_old_/contract/tool/calc"
import SidePainter from "../painter/side"
import SideProj from "./side-projection"
import SlicesContainer from "../slices-container"
import StandardPainter from "../painter/standard"
import StandardProj from "./standard-projection"
import { ensureLazySnapshotInterface } from "@/_old_/contract/manager/lazy-snapshot"
import { half } from "@/_old_/constants"
import { SlicesBezierCurveControlPoint } from "@/_old_/contract/feature/morphology-collage"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./quad-view.css"
import SceneManagerInterface, {
    ensureSceneManagerInterface,
} from "@/_old_/contract/manager/scene"

export interface QuadViewProps {
    className?: string
    slicesContainer: SlicesContainer
}

const TWO = 2
const R = half(Math.sqrt(TWO))
const FRONT_QUATERNION: Quaternion = [0, 0, 0, 1]
const TOP_QUATERNION: Quaternion = [-R, 0, 0, R]
const RIGHT_QUATERNION: Quaternion = [0, R, 0, R]

export default function QuadView(props: QuadViewProps) {
    const { calc, scene, lazySnapshot } = useServiceLocator({
        calc: ensureCalcInterface,
        scene: ensureSceneManagerInterface,
        lazySnapshot: ensureLazySnapshotInterface,
    })
    const { refSidePainter, refStandardPainter } = usePainters(
        props.slicesContainer,
        calc,
        scene
    )
    const handleControlPointChange = useControlPointChangehandler(props)
    return (
        <div className={getClassNames(props)}>
            <div>
                <SideProj
                    painter={refSidePainter.current}
                    lazySnapshot={lazySnapshot}
                    slicesContainer={props.slicesContainer}
                    cameraOrientation={TOP_QUATERNION}
                    onControlPointChange={handleControlPointChange}
                />
                <label>Top</label>
            </div>
            <div>
                <StandardProj painter={refStandardPainter.current} />
            </div>
            <div>
                <SideProj
                    painter={refSidePainter.current}
                    lazySnapshot={lazySnapshot}
                    slicesContainer={props.slicesContainer}
                    cameraOrientation={FRONT_QUATERNION}
                    onControlPointChange={handleControlPointChange}
                />
                <label>Face</label>
            </div>
            <div>
                <SideProj
                    painter={refSidePainter.current}
                    lazySnapshot={lazySnapshot}
                    slicesContainer={props.slicesContainer}
                    cameraOrientation={RIGHT_QUATERNION}
                    onControlPointChange={handleControlPointChange}
                />
                <label>Right</label>
            </div>
        </div>
    )
}

function usePainters(
    slicesContainer: SlicesContainer,
    calc: CalcInterface,
    scene: SceneManagerInterface
) {
    const refSidePainter = React.useRef(new SidePainter(calc, scene.camera))
    const refStandardPainter = React.useRef(
        new StandardPainter(calc, scene.camera)
    )
    React.useEffect(() => {
        const handlePaint = () => {
            const bezier = slicesContainer.bezier
            const slices = slicesContainer.slices
            refSidePainter.current.paint(bezier)
            refStandardPainter.current.paint(slices)
        }
        slicesContainer.eventChange.add(handlePaint)
        return () => slicesContainer.eventChange.remove(handlePaint)
    }, [slicesContainer])
    return { refSidePainter, refStandardPainter }
}

function useControlPointChangehandler(props: QuadViewProps) {
    return React.useCallback(
        (point: SlicesBezierCurveControlPoint) => {
            switch (point.type) {
                case "start":
                    props.slicesContainer.updateBezier({ pointStart: point })
                    break
                case "end":
                    props.slicesContainer.updateBezier({ pointEnd: point })
                    break
            }
        },
        [props.slicesContainer]
    )
}

function getClassNames(props: QuadViewProps): string {
    const classNames = ["custom", "feature-bezierSlices-main-QuadView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
