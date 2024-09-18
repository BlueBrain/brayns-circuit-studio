import * as React from "react"
import AxisView from "@/_old_/view/axis-gizmo"
import Button from "@/_old_/ui/view/button"
import CalcInterface from "@/_old_/contract/tool/calc"
import CameraManagerInterface from "@/_old_/contract/manager/camera"
import Flex from "@/_old_/ui/view/flex"
import InputInteger from "@/_old_/ui/view/input/integer"
import SlicesContainer from "../slices-container"
import { SlicesBezierCurve } from "@/_old_/contract/feature/morphology-collage"
import "./menu-view.css"
import HelpButton from "../../../help-button"

export interface MenuViewValue {
    slicesCount: number
    width: number
    height: number
}

export interface MenuViewProps {
    className?: string
    calc: CalcInterface
    cameraManager: CameraManagerInterface
    slicesContainer: SlicesContainer
    onCancel(this: void): void
    onValidate(this: void): void
}

export default function MenuView(props: MenuViewProps) {
    const slicesDef = useSlicesDef(props.slicesContainer)
    const update = React.useCallback(
        (update: Partial<SlicesBezierCurve>) => {
            props.slicesContainer.updateBezier(update)
        },
        [props.slicesContainer]
    )
    return (
        <div className={getClassNames(props)}>
            <div className="grid">
                <div className="gizmo">
                    <AxisView camera={props.cameraManager} calc={props.calc} />
                </div>
                <InputInteger
                    label="Number of slices"
                    min={3}
                    value={slicesDef.slicesCount}
                    onChange={(slicesCount) => update({ slicesCount })}
                />
                <InputInteger
                    label="Slice Width (µm)"
                    min={1}
                    value={slicesDef.width}
                    onChange={(snapshotWidth) =>
                        update({ width: snapshotWidth })
                    }
                />
                <InputInteger
                    label="Slice Height (µm)"
                    min={1}
                    value={slicesDef.height}
                    onChange={(snapshotHeight) =>
                        update({ height: snapshotHeight })
                    }
                />
                <Button label="Cancel" flat={true} onClick={props.onCancel} />
                <Button label="Validate" onClick={props.onValidate} />
            </div>
            <hr />
            <Flex>
                <HelpButton label="Help" topic="slices/edit" />
            </Flex>
        </div>
    )
}

function getClassNames(props: MenuViewProps): string {
    const classNames = [
        "custom",
        "theme-color-frame",
        "feature-bezierSlices-main-MenuView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function useSlicesDef(slicesContainer: SlicesContainer): SlicesBezierCurve {
    const [slicesDef, setSlicesDef] = React.useState(slicesContainer.bezier)
    React.useEffect(() => {
        const handler = () => setSlicesDef(slicesContainer.bezier)
        slicesContainer.eventChange.add(handler)
        return () => slicesContainer.eventChange.remove(handler)
    }, [slicesContainer])
    return slicesDef
}
