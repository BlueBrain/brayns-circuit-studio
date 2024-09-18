import { VolumeModel } from "@/_old_/contract/manager/models"
import Dialog from "@/_old_/ui/view/dialog"
import Error from "@/_old_/view/Error"
import React from "react"
import { ensureBackendManagerInterface } from "../../../contract/manager/backend"
import { useServiceLocator } from "../../../tool/locator"
import RunnableView from "../../../ui/view/runnable/runnable-view"
import Styles from "./volume-params.module.css"

export interface VolumeParamsProps {
    path: string
    onCancel(this: void): void
    onOK(this: void, volumeModel: VolumeModel): void
}

const DEFAULT_VOLUME_MODEL: VolumeModel = {
    type: "volume",
    boundingBox: { min: [-1, -1, -1], max: [+1, +1, +1] },
    cameraTarget: [0, 0, 0],
    colors: {
        method: "solid",
        values: { color: [1, 0.8, 0.6, 1] },
    },
    id: 0,
    modelIds: [],
    modelTypes: [],
    name: "",
    path: "",
    loader: {
        name: "",
        data: {},
    },
    visible: true,
    format: "orientation",
    useCase: "",
    availableUseCases: [],
}

export default function VolumeParams({
    path,
    onCancel,
    onOK,
}: VolumeParamsProps) {
    const { backend } = useServiceLocator({
        backend: ensureBackendManagerInterface,
    })
    const [format, setFormat] = React.useState<
        "scalar" | "orientation" | "flatmap" | null
    >(null)
    const [error, setError] = React.useState<unknown>(null)
    const [volumeHeader, setVolumeHeader] = React.useState<null | Record<
        string,
        string
    >>(null)
    React.useEffect(() => {
        backend
            .volumeParseHeader(path)
            .then(checkVolumeValidity(setVolumeHeader, setFormat, setError))
            .catch(setError)
    }, [backend])
    const accept = (format: "scalar" | "orientation" | "flatmap") => {
        const model: VolumeModel = {
            ...DEFAULT_VOLUME_MODEL,
            format,
            path,
        }
        onOK(model)
    }
    return (
        <RunnableView running={!error && !volumeHeader}>
            <Dialog
                title="Load volume file (NRRD)"
                labelCancel="Cancel"
                labelOK="Load"
                valid={Boolean(format && !error)}
                onCancel={onCancel}
                onOK={() => accept(format ?? "orientation")}
            >
                <div className={Styles.VolumeParams}>
                    <code>{path}</code>
                    <Error value={error} />
                    {format === "scalar" && (
                        <p>
                            Each voxel is a single scalar that will be
                            represented as a <b>color</b>.
                        </p>
                    )}
                    {format === "orientation" && (
                        <p>
                            Each voxel is a quaternion that will be represented
                            as an <b>orientation</b>.
                        </p>
                    )}
                    {format === "flatmap" && (
                        <p>
                            This volume is a <b>Flatmap</b>.
                        </p>
                    )}
                    {volumeHeader && (
                        <div className={Styles.grid}>
                            {Object.keys(volumeHeader).map((key) => (
                                <>
                                    <div key={`K/${key}`}>{key}:</div>
                                    <div key={`V/${key}`}>
                                        {volumeHeader[key]}
                                    </div>
                                </>
                            ))}
                        </div>
                    )}
                </div>
            </Dialog>
        </RunnableView>
    )
}
function checkVolumeValidity(
    setVolumeHeader: React.Dispatch<
        React.SetStateAction<Record<string, string> | null>
    >,
    setFormat: React.Dispatch<
        React.SetStateAction<"orientation" | "scalar" | "flatmap" | null>
    >,
    setError: (error: unknown) => void
):
    | ((value: Record<string, string>) => void | PromiseLike<void>)
    | null
    | undefined {
    return (header) => {
        setVolumeHeader(header)
        console.log("🚀 [volume-params] header = ", header) // @FIXME: Remove this line written on 2023-02-13 at 10:25
        const dimension = header.dimension ?? "unknown"
        if (dimension !== "4" && dimension !== "3") {
            setError(
                `Brayns can only display volumes with 4 dimensions.
But this one has ${dimension} dimensions!`
            )
            return
        }
        const [head] = (header.sizes ?? "").split(" ")
        const elementsPerVoxel: string = dimension === "3" ? "1" : head
        switch (elementsPerVoxel) {
            case "1":
                setFormat("scalar")
                break
            case "2":
                setFormat("flatmap")
                break
            case "4":
                setFormat("orientation")
                break
            default:
                setError(
                    `We don't know how to display volumes with ${elementsPerVoxel} elements (of type ${
                        header.type ?? "unknown"
                    }) per voxel!`
                )
        }
    }
}
