import * as React from "react"
import MenuView from "./menu"
import QuadView from "./quad"
import SlicesContainer from "./slices-container"
import { ensureCalcInterface } from "@/_old_/contract/tool/calc"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./morphology-collage.css"
import {
    Collage,
    ensureMorphologyCollageFeatureInterface,
    SlicesBezierCurve,
} from "@/_old_/contract/feature/morphology-collage"

export interface MainViewProps {
    className?: string
    collage: Collage
    onCancel(this: void): void
    onValidate(bezierCurve: SlicesBezierCurve): void
}

export default function MainView(props: MainViewProps) {
    const { calc, morphologyCollage, scene } = useServiceLocator({
        calc: ensureCalcInterface,
        morphologyCollage: ensureMorphologyCollageFeatureInterface,
        scene: ensureSceneManagerInterface,
    })
    const refSlicesContainer = React.useRef(
        new SlicesContainer(morphologyCollage)
    )
    React.useEffect(() => {
        const { bezierCurve } = props.collage
        if (bezierCurve) refSlicesContainer.current.bezier = bezierCurve
    }, [props.collage])
    const handleValidate = () => props.onValidate(slicesContainer.bezier)
    const slicesContainer = refSlicesContainer.current
    const cameraManager = scene.camera
    return (
        <div className={getClassNames(props)}>
            <QuadView className="quad-view" slicesContainer={slicesContainer} />
            <MenuView
                className="menu-view"
                calc={calc}
                cameraManager={cameraManager}
                slicesContainer={slicesContainer}
                onCancel={props.onCancel}
                onValidate={handleValidate}
            />
        </div>
    )
}

function getClassNames(props: MainViewProps): string {
    const classNames = ["custom", "view-page-MorphologyCollage"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
