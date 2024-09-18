import { CellPlacementModel } from "@/_old_/contract/manager/models"
import { ensureStorageInterface } from "@/_old_/contract/storage/storage"
import { useServiceLocator } from "@/_old_/tool/locator"
import Dialog from "@/_old_/ui/view/dialog"
import InputText from "@/_old_/ui/view/input/text"
import Label from "@/_old_/ui/view/label/label-view"
import Options from "@/_old_/ui/view/options/options-view"
import Runnable from "@/_old_/ui/view/runnable"
import Slider from "@/_old_/ui/view/slider"
import * as React from "react"
import Style from "./cell-placement-params-view.module.css"
import { ensureFileSystemServiceInterface } from "../../../contract/service/file-system"
import { useDebouncedEffect } from "../../../ui/hooks/debounced-effect"
import Spinner from "../../../ui/view/spinner/spinner-view"
import Icon from "../../../ui/view/icon/icon-view"
import MorphoTogglers from "@/_old_/view/MorphoTogglers/MorphoTogglers"

export interface CellPlacementParamsViewProps {
    className?: string
    path: string
    onOK(this: void, model: CellPlacementModel): void
    onCancel(this: void): void
}

const STORAGE_KEY = "Cell placement loader/morphology_folder"

const DEFAULT_MODEL: CellPlacementModel = {
    type: "Cell placement loader",
    boundingBox: { min: [-1, -1, -1], max: [+1, +1, +1] },
    cameraTarget: [0, 0, 0],
    colors: { method: "solid", values: { color: [0.8, 1, 0.6, 1] } },
    id: 0,
    modelIds: [],
    modelTypes: [],
    name: "Cell Placement",
    path: "",
    showAxon: false,
    showDendrites: false,
    showSoma: false,
    loader: {
        name: "",
        data: {},
    },
    visible: true,
    morphologyFolder: "",
    percentage: 100,
    extension: "",
}

export default function CellPlacementParamsView(
    props: CellPlacementParamsViewProps
) {
    const [busy, setBusy] = React.useState(true)
    const [folderExists, setFolderExists] = React.useState(false)
    const { fileSystem, userStorage } = useServiceLocator({
        fileSystem: ensureFileSystemServiceInterface,
        userStorage: ensureStorageInterface,
    })
    const [model, setModel] = React.useState<null | CellPlacementModel>(null)
    useDebouncedEffect(
        () => {
            setBusy(true)
            if (!model) return

            setFolderExists(false)
            fileSystem
                .directoryExists(model.morphologyFolder)
                .then((exists) => {
                    setFolderExists(exists)
                    setBusy(false)
                })
                .catch((ex) => {
                    console.error(ex)
                    setBusy(false)
                })
        },
        [model],
        300
    )
    React.useEffect(() => {
        if (model) return

        userStorage
            .load(STORAGE_KEY, "")
            .then((morphologyFolder: string) => {
                setModel({ ...DEFAULT_MODEL, morphologyFolder })
            })
            .catch(console.error)
    }, [model])
    const update = (value: Partial<CellPlacementModel>) => {
        if (value.morphologyFolder !== model?.morphologyFolder) {
            void userStorage.save(STORAGE_KEY, value.morphologyFolder)
        }
        setModel({ ...DEFAULT_MODEL, ...model, ...value })
    }
    const currentModel = model ?? DEFAULT_MODEL
    return (
        <Runnable running={!model}>
            <Dialog
                className={props.className}
                title="Load Cell Placement file"
                accent={true}
                labelOK="Load"
                labelCancel="Cancel"
                onCancel={props.onCancel}
                onOK={() => {
                    props.onOK({
                        ...(model ?? DEFAULT_MODEL),
                        path: props.path,
                    })
                }}
                valid={folderExists}
            >
                <div className={Style.cellPlacementParams}>
                    <div>
                        <InputText
                            wide={true}
                            label="Morphologies Folder"
                            value={currentModel.morphologyFolder}
                            onChange={(morphologyFolder) =>
                                update({ morphologyFolder })
                            }
                        />
                        <div>
                            {busy && (
                                <Spinner label="Checking morphology folder..." />
                            )}
                            {!busy && (
                                <>
                                    {folderExists ? (
                                        <div className={Style.flex}>
                                            <Icon name="correct" color="#0f0" />
                                            <div>This folder exists.</div>
                                        </div>
                                    ) : (
                                        <div className={Style.flex}>
                                            <Icon name="wrong" color="#f00" />
                                            <div>
                                                This folder does not exists, or
                                                is not accessible!
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        <Label
                            value={`Percentage of cells to load: (${currentModel.percentage}%)`}
                        />
                        <Slider
                            min={1}
                            max={100}
                            steps={1}
                            value={currentModel.percentage}
                            onChange={(percentage) => update({ percentage })}
                        />
                    </div>
                    <Options
                        label="Extension of the morphology files"
                        options={{
                            "": "Any",
                            asc: "Only *.asc",
                            h5: "Only *.h5",
                            swc: "Only *.swc",
                        }}
                        value={currentModel.extension}
                        onChange={(extension) => update({ extension })}
                    />
                    <MorphoTogglers circuit={currentModel} onChange={update} />
                </div>
            </Dialog>
        </Runnable>
    )
}
