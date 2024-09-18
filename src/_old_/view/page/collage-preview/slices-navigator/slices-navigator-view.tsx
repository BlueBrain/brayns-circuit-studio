import * as React from "react"
import FloatingButton from "@/_old_/ui/view/floating-button"
import Slider from "@/_old_/ui/view/slider"
import { ensureCalcInterface } from "@/_old_/contract/tool/calc"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { half } from "@/_old_/constants"
import { Slices } from "@/_old_/contract/feature/morphology-collage"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./slices-navigator-view.css"

export interface SlicesNavigatorViewProps {
    className?: string
    slices: Slices
}

export default function SlicesNavigatorView(props: SlicesNavigatorViewProps) {
    const { calc, scene } = useServiceLocator({
        calc: ensureCalcInterface,
        scene: ensureSceneManagerInterface,
    })
    const { slices } = props
    const [currentSliceIndex, setCurrentSliceIndex] = React.useState(0)
    React.useEffect(() => {
        const slice = slices.positions[currentSliceIndex]
        if (!slice) return

        const axis = calc.getAxisFromQuaternion(slice.orientation)
        void scene.imageStream.transaction(async () => {
            const { camera, clippingPlanes } = scene
            camera.setHeightAtTarget(slices.height)
            camera.updateParams({
                target: slice.center,
                orientation: slice.orientation,
                distance: slices.depth,
            })
            await camera.updateNow()
            await clippingPlanes.clear()
            await clippingPlanes.add(
                calc.addVectors(
                    slice.center,
                    calc.scaleVector(axis.z, half(slices.depth))
                ),
                calc.scaleVector(axis.z, -1)
            )
            await clippingPlanes.add(
                calc.addVectors(
                    slice.center,
                    calc.scaleVector(axis.z, -half(slices.depth))
                ),
                calc.scaleVector(axis.z, +1)
            )
        })
    }, [currentSliceIndex])
    return (
        <nav className={getClassNames(props)}>
            <FloatingButton
                icon="arrow-left"
                enabled={currentSliceIndex > 0}
                onClick={() => setCurrentSliceIndex(currentSliceIndex - 1)}
            />
            <FloatingButton
                icon="arrow-right"
                enabled={currentSliceIndex < slices.positions.length - 1}
                onClick={() => setCurrentSliceIndex(currentSliceIndex + 1)}
            />
            <div className="position">
                <div>{currentSliceIndex + 1}</div>
                <div className="total">/ {slices.positions.length}</div>
            </div>
            <Slider
                className="slider"
                value={currentSliceIndex}
                onChange={setCurrentSliceIndex}
                min={0}
                max={slices.positions.length - 1}
                steps={1}
                wide={true}
            />
        </nav>
    )
}

function getClassNames(props: SlicesNavigatorViewProps): string {
    const classNames = [
        "custom",
        "view-page-collagePreview-SlicesNavigatorView",
        "theme-color-frame",
        "theme-shadow-header",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
