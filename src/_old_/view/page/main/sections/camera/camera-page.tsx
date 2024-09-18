import JSON5 from "json5"
import * as React from "react"

import CameraModuleInterface from "@/_old_/contract/manager/camera"
import { ensureFileSaverInterface } from "@/_old_/contract/manager/file-saver"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import {
    ensureCalcInterface,
    Quaternion,
    Vector3,
    Vector4,
} from "@/_old_/contract/tool/calc"
import Calc from "@/_old_/tool/calc/calc"
import { useServiceLocator } from "@/_old_/tool/locator"
import { assertType } from "@/_old_/tool/validator"
import { useModal } from "@/_old_/ui/modal"
import Button from "@/_old_/ui/view/button"
import InputFile from "@/_old_/ui/view/input/file/input-file"
import ImageStreamStats from "./image-stream-stats/ImageStreamStats"

import "./camera-page.css"

export interface CameraPageProps {
    className?: string
    camera: CameraModuleInterface
}

export default function CameraPage(props: CameraPageProps) {
    const modal = useModal()
    const { calc, fileSaver, scene } = useServiceLocator({
        calc: ensureCalcInterface,
        fileSaver: ensureFileSaverInterface,
        scene: ensureSceneManagerInterface,
    })
    const info = useCameraParams(props.camera)
    const axis = calc.getAxisFromQuaternion(info.orientation)
    const handleExport = async () => {
        fileSaver.saveJSON(info, "camera.json", true)
        await modal.info(
            <div>
                Your file will be exported in your
                <b>Download</b> folder.
            </div>
        )
    }
    const handleImport = (files: FileList) => {
        const file = files.item(0)
        if (!file) return

        InputFile.readFileAsText(file)
            .then((content: string) => {
                const data: unknown = JSON5.parse(content)
                assertType<CameraInfo>(data, {
                    position: ["array(3)", "number"],
                    target: ["array(3)", "number"],
                    distance: "number",
                    orientation: ["array(4)", "number"],
                })
                scene.camera.updateParams(data)
                void scene.imageStream.askForNextFrame()
            })
            .catch((ex) => modal.error(ex))
    }

    return (
        <div className={getClassNames(props)}>
            <div className="grid">
                <div>Position</div>
                {renderNumbers(...info.position)}
                <div>Target</div>
                {renderNumbers(...info.target)}
                <div>X Axis</div>
                {renderNumbers(...axis.x)}
                <div>Y Axis</div>
                {renderNumbers(...axis.y)}
                <div>Z Axis</div>
                {renderNumbers(...axis.z)}
                <details>
                    <summary>Orientation</summary>
                    {renderNumbers(...info.orientation)}
                </details>
                <div>Distance</div>
                {renderNumbers(info.distance)}
                <div>Height</div>
                {renderNumbers(info.height)}
            </div>
            <div className="import-export">
                <Button
                    label="Export"
                    icon="export"
                    onClick={() => void handleExport()}
                />
                <InputFile
                    accept=".json"
                    label="Import"
                    icon="import"
                    color="accent"
                    onClick={handleImport}
                />
            </div>
            <fieldset>
                <legend>Python code:</legend>
                <pre className="python-code">
                    {[
                        `await exec("set-camera-view", {
    "position": ${JSON.stringify(info.position)},
    "target": ${JSON.stringify(info.target)},
    "up": ${JSON.stringify(getUpVector(info.orientation))}
})`,
                        `await exec("set-camera-orthographic", {
    "height": ${info.height}
})`,
                    ].join("\n")}
                </pre>
            </fieldset>
            <hr />
            <ImageStreamStats />
        </div>
    )
}

function renderNumbers(...numbers: number[]): React.ReactNode {
    return (
        <>
            {numbers.map((num, idx) => {
                const [int, dec] = num.toFixed(6).split(".")
                return (
                    <div
                        key={`${idx}/${num}`}
                        className="number"
                        title={`${num}`}
                    >
                        <span>{int}</span>
                        <span className="dec">.{dec ?? "0"}</span>
                    </div>
                )
            })}
        </>
    )
}

function getClassNames(props: CameraPageProps): string {
    const classNames = ["custom", "view-page-CameraPage"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

interface CameraInfo {
    position: Vector3
    target: Vector3
    distance: number
    orientation: Quaternion
    height: number
}

function extractCameraInfo(camera: CameraModuleInterface): CameraInfo {
    return {
        ...camera.params,
        position: camera.position,
        height: camera.getHeightAtTarget(),
    }
}

function useCameraParams(camera: CameraModuleInterface): CameraInfo {
    const [info, setInfo] = React.useState<CameraInfo>(
        extractCameraInfo(camera)
    )
    React.useEffect(() => {
        const handleChange = (cameraManager: CameraModuleInterface) => {
            setInfo(extractCameraInfo(cameraManager))
        }
        camera.eventChange.add(handleChange)
        return () => camera.eventChange.remove(handleChange)
    }, [camera])
    return info
}

function getUpVector(orientation: Vector4): Vector3 {
    const calc = new Calc()
    return calc.getAxisFromQuaternion(orientation).y
}
