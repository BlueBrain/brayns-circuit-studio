import {
    CircuitModel,
    CircuitModelReport,
    SimulationModel,
} from "@/_old_/contract/manager/models"
import SceneManagerInterface from "@/_old_/contract/manager/scene"
import { useLocalStorageState } from "@/_old_/ui/hooks"
import Button from "@/_old_/ui/view/button"
import Expand from "@/_old_/ui/view/expand"
import Flex from "@/_old_/ui/view/flex"
import InputFloat from "@/_old_/ui/view/input/float"
import InputText from "@/_old_/ui/view/input/text"
import Options from "@/_old_/ui/view/options"
import Markdown from "markdown-to-jsx"
import * as React from "react"
import HelpButton from "../../../../help-button"
import KeyFramesEditor, { KeyFrame } from "./KeyFramesEditor"
import HelpContent from "./help.md"
import StepIndex from "./step-index"

import "./movie-page.css"
import { createKeyframeFromCurrentCamera } from "./utils"
import { useServiceLocator } from "../../../../../tool/locator"
import CalcInterface, {
    ensureCalcInterface,
} from "../../../../../contract/tool/calc"

export interface MoviePageOptions {
    width: number
    height: number
    fps: number
    firstStep: number
    lastStep: number
    /** Movie duration in seconds. */
    duration: number
    reportDuration: number
    reportRange: [number, number]
    reportDataUnit: string
    reportTimeUnit: string
    reportStepsCount: number
    /** If defined, it will help you get nodes on BB5. */
    reservation: string
    mainModelId: number
    account: string
    keyframes: KeyFrame[]
}

export interface MoviePageProps {
    className?: string
    scene: SceneManagerInterface
    onRender(options: MoviePageOptions): void
}

const RESOLUTIONS: { [key: string]: string } = {
    "960x540": "Preview",
    "1920x1080": "Full HD",
    "3840x2160": "4K",
}

export default function MoviePage(props: MoviePageProps) {
    return (
        <div className={getClassNames(props)}>
            <h1>Movie maker</h1>
            <MainMovieSection {...props} />
        </div>
    )
}

function getClassNames(props: MoviePageProps): string {
    const classNames = ["custom", "view-page-MoviePage"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function MainMovieSection(props: MoviePageProps) {
    const { calc } = useServiceLocator({ calc: ensureCalcInterface })
    const { simulation } = props.scene
    const circuits = props.scene.models.circuit.useItems()
    const simulations = circuits.filter(hasSimulation) as SimulationModel[]
    const mainModel: SimulationModel | undefined = simulations[0]
    const [account, setAccount] = useLocalStorageState(
        "proj3",
        "movie-generator/account"
    )
    const [firstStep, setFirstStep] = React.useState(0)
    const [lastStep, setLastStep] = React.useState(simulation.stepsCount - 1)
    const [fps, setFps] = React.useState(30)
    const [duration, setDuration] = React.useState(simulation.stepsCount / fps)
    const [reservation, setReservation] = React.useState("")
    const [resolution, setResolution] = React.useState("1920x1080")
    const [keyframes, setKeyframes] = useLocalStorageState<KeyFrame[]>(
        [],
        "MovieMaker/Camera/KeyFrames"
    )
    const handleTurnTable = useTurnTableHandler(
        calc,
        props.scene,
        duration * fps,
        setKeyframes
    )
    return (
        <div>
            <HelpButton
                label="Open the documentation..."
                topic="movie-maker"
                flat={true}
            />
            {props.scene.simulation.enabled && mainModel && (
                <>
                    {renderReportInfo(mainModel.report)}
                    <Flex justifyContent="space-between" alignItems="center">
                        <StepIndex
                            label="First step"
                            value={firstStep}
                            onChange={setFirstStep}
                            simulation={simulation}
                        />
                        <StepIndex
                            label="Last step"
                            value={lastStep}
                            onChange={setLastStep}
                            simulation={simulation}
                        />
                    </Flex>
                </>
            )}
            <Flex justifyContent="space-between" alignItems="center">
                <InputFloat
                    label="Movie duration in sec."
                    size={9}
                    truncate={2}
                    value={duration}
                    onChange={setDuration}
                />
                <Options
                    label="Frames per second"
                    value={`${fps}`}
                    onChange={(value) => setFps(parseInt(value))}
                    options={{
                        "30": "30",
                        "60": "60",
                    }}
                />
            </Flex>
            <Options
                label={`Resolution (${resolution})`}
                value={resolution}
                onChange={setResolution}
                options={RESOLUTIONS}
            />
            <Expand label="Camera moves" icon="camera">
                <Flex alignItems="center" justifyContent="space-between">
                    <Button
                        label="Create a turn table (360°)"
                        icon="turn-table"
                        enabled={duration > 0}
                        flat={true}
                        onClick={handleTurnTable}
                    />
                    <HelpButton topic="movie-maker/turn-table" />
                </Flex>
                <KeyFramesEditor
                    keyframes={keyframes}
                    onChange={setKeyframes}
                    scene={props.scene}
                />
            </Expand>
            <Flex justifyContent="space-between">
                <InputText
                    label="Account"
                    validator={/proj[0-9X]+/g}
                    value={account}
                    onChange={setAccount}
                    size={4}
                />
                <InputText
                    label="BB5 reservation (if any)"
                    value={reservation}
                    onChange={setReservation}
                />
            </Flex>
            <Button
                label="Create rendering scripts"
                wide
                icon="python"
                enabled={duration > 0}
                onClick={() => {
                    const modelId = mainModel?.modelIds
                        ? mainModel.modelIds[0]
                        : -1
                    props.onRender({
                        width: getWidthFromResolution(resolution),
                        height: getHeightFromResolution(resolution),
                        fps,
                        duration,
                        firstStep: mainModel ? firstStep : 0,
                        lastStep: mainModel ? lastStep : duration * fps - 1,
                        reportDataUnit: mainModel
                            ? mainModel.report.dataUnit
                            : "fr",
                        reportDuration: mainModel
                            ? mainModel.report.totalDuration
                            : duration * fps,
                        reportRange: mainModel
                            ? mainModel.report.range
                            : [0, 1],
                        reportStepsCount: mainModel
                            ? mainModel.report.frames
                            : duration * fps,
                        reportTimeUnit: mainModel
                            ? mainModel.report.timeUnit
                            : "fr",
                        reservation,
                        mainModelId: modelId,
                        account,
                        keyframes,
                    })
                }}
            />
            <Markdown>{HelpContent}</Markdown>
        </div>
    )
}

function renderReportInfo(report: CircuitModelReport) {
    return (
        <fieldset>
            <legend>Report info</legend>
            <div className="grid">
                <div>Name:</div>
                <div>{report.name}</div>
                <div>Duration:</div>
                <div>
                    {report.totalDuration} {report.timeUnit}
                </div>
                <div>Range:</div>
                <div>
                    [{report.range[0]} {report.dataUnit},&nbsp;
                    {report.range[1]} {report.dataUnit} ]
                </div>
            </div>
        </fieldset>
    )
}

/**
 * Resolution has this format: "640x480".
 * This function extracts the width (640 here).
 */
function getWidthFromResolution(resolution: string): number {
    const [width, _height] = resolution.split("x")
    return parseInt(width)
}

/**
 * Resolution has this format: "640x480".
 * This function extracts the height (480 here).
 */
function getHeightFromResolution(resolution: string): number {
    const [_width, height] = resolution.split("x")
    return parseInt(height)
}

function hasSimulation(circuit: CircuitModel) {
    return typeof circuit.report !== "undefined"
}

function useTurnTableHandler(
    calc: CalcInterface,
    scene: SceneManagerInterface,
    framesCount: number,
    setKeyframes: (value: KeyFrame[]) => void
) {
    return () => {
        const keyframes: KeyFrame[] = [createKeyframeFromCurrentCamera(scene)]
        const steps = 4
        const angle = (2 * Math.PI * framesCount) / (steps * (framesCount + 1))
        console.log(
            "🚀 [movie-page] angle * 180 / Math.PI = ",
            (angle * 180) / Math.PI
        ) // @FIXME: Remove this line written on 2023-09-26 at 15:15
        for (let step = 0; step < steps; step++) {
            const axis = calc.getAxisFromQuaternion(
                scene.camera.params.orientation
            )
            const orientation = calc.rotateQuaternionAroundVector(
                scene.camera.params.orientation,
                axis.y,
                angle
            )
            console.log("🚀 [movie-page] orientation = ", orientation) // @FIXME: Remove this line written on 2023-09-26 at 15:15
            scene.camera.updateParams({ orientation })
            keyframes.push(createKeyframeFromCurrentCamera(scene))
        }
        setKeyframes(keyframes)
    }
}
