import * as React from "react"
import Async from "@/_old_/tool/async"
import AxisGizmo from "@/_old_/view/axis-gizmo"
import CalcInterface, { ensureCalcInterface } from "@/_old_/contract/tool/calc"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import Flex from "../../../../ui/view/flex"
import FloatingButton from "@/_old_/ui/view/floating-button"
import SceneView from "../../../scene"
import SimulationBarView from "@/_old_/view/simulation-bar"
import { ensureScalebarCanvasPainterInterface } from "@/_old_/contract/painter/scalebar"
import { useOrthographicCamera } from "../hook"
import { useScalebar } from "../hook/scalebar"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./main-view.css"
import SceneManagerInterface, {
    ensureSceneManagerInterface,
} from "@/_old_/contract/manager/scene"

export interface AppMainViewProps {
    className?: string
    minimalUI: boolean
    onPythonClick(this: void): void
    onSnapshotClick(this: void): void
    onBackgroundClick(this: void): void
}

export default function AppMainView(props: AppMainViewProps) {
    const { calc, scene, scalebarPainter } = useServiceLocator({
        calc: ensureCalcInterface,
        scene: ensureSceneManagerInterface,
        scalebarPainter: ensureScalebarCanvasPainterInterface,
    })
    const refScreen = React.useRef<HTMLDivElement | null>(null)
    const refScalebar = useScalebar(refScreen, scene.camera, scalebarPainter)
    const [isOrthographic, setOrthographic] = useOrthographicCamera(
        scene.camera
    )
    const [
        handlePlaySimulation,
        handleStopSimulation,
        handleSimulationStepChange,
        handleSimulationSpeedChange,
    ] = makeSimulationHandlers(scene)
    return (
        <main className={getClassNames(props)}>
            <div className="scene" ref={refScreen}>
                <SceneView className="image-stream" />
                <Controls
                    minimalUI={props.minimalUI}
                    camera={scene.camera}
                    calc={calc}
                    scene={scene}
                    isOrthographic={isOrthographic}
                    setOrthographic={setOrthographic}
                    onPythonClick={props.onPythonClick}
                    onSnapshotClick={props.onSnapshotClick}
                    onBackgroundClick={props.onBackgroundClick}
                />
                <canvas
                    ref={refScalebar}
                    className={`scalebar ${isOrthographic ? "show" : "hide"}`}
                ></canvas>
            </div>
            <SimulationBarView
                className="simulation-bar"
                simulation={scene.simulation}
                onPlay={handlePlaySimulation}
                onStop={handleStopSimulation}
                onStepChange={handleSimulationStepChange}
                onSpeedChange={handleSimulationSpeedChange}
            />
        </main>
    )
}

function getClassNames(props: AppMainViewProps): string {
    const classNames = ["custom", "view-app-AppMainView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

interface ControlsProps {
    minimalUI: boolean
    camera: CameraModuleInterface
    calc: CalcInterface
    scene: SceneManagerInterface
    isOrthographic: boolean
    setOrthographic(this: void, value: boolean): void
    onPythonClick(this: void): void
    onSnapshotClick(this: void): void
    onBackgroundClick(this: void): void
}

function Controls(props: ControlsProps) {
    const clippingPlanes = props.scene.clippingPlanes.useClippingPlanes()
    return (
        <div className="icons">
            <AxisGizmo camera={props.camera} calc={props.calc} />
            {!props.minimalUI && (
                <Flex justifyContent="flex-end" direction="column" gap="1em">
                    <FloatingButton
                        icon="snapshot"
                        onClick={props.onSnapshotClick}
                    />
                    <FloatingButton
                        icon="python"
                        onClick={props.onPythonClick}
                    />
                    {clippingPlanes.length > 0 && (
                        <FloatingButton
                            icon="cut-off"
                            accent={true}
                            title="Remove all the current clipping planes"
                            onClick={() =>
                                void props.scene.clippingPlanes.clear()
                            }
                        />
                    )}
                    <FloatingButton
                        icon="fill"
                        onClick={props.onBackgroundClick}
                    />
                </Flex>
            )}
        </div>
    )
}

function makeSimulationHandlers(
    scene: SceneManagerInterface
): [() => void, () => void, (step: number) => void, (speed: number) => void] {
    const { simulation } = scene
    const handlePlaySimulation = () => (simulation.playing = true)
    const handleStopSimulation = () => (simulation.playing = false)
    const STEP_CHANGE_THROTTLING_DELAY = 100
    const handleSimulationStepChange = Async.throttle(
        (step: number) => (simulation.currentStep = step),
        STEP_CHANGE_THROTTLING_DELAY
    )
    const handleSimulationSpeedChange = (speed: number) => {
        simulation.speed = speed
    }
    return [
        handlePlaySimulation,
        handleStopSimulation,
        handleSimulationStepChange,
        handleSimulationSpeedChange,
    ]
}
