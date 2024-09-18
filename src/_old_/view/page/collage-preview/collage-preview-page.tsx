import * as React from "react"
import AspectRatioKeeperView from "@/_old_/view/aspect-ratio-keeper/aspect-ratio-keeper-view"
import Button from "@/_old_/ui/view/button"
import CellDetailView from "./cell-detail/cell-detail-view"
import CellsDensityPerSliceView from "./cells-density-per-slice/cells-density-per-slice-view"
import ImageStreamView from "@/_old_/view/image-stream"
import InputText from "@/_old_/ui/view/input/text"
import { useModal } from "@/_old_/ui/modal"
import SlicesNavigatorView from "./slices-navigator/slices-navigator-view"
import SnapshotDimensionsView from "./snapshot-dimensions/snapshot-dimensions-view"
import { Collage } from "@/_old_/contract/feature/morphology-collage"
import { DEFAULT_COLLAGE_CELLS_DENSITY } from "@/_old_/constants"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { generateScriptsForMorphologyCollage } from "./scripts-generator"
import { useCanvasClick } from "./hooks/canvas-click"
import { useLocalStorageState } from "@/_old_/ui/hooks"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./collage-preview-page.css"
import { ensureFileSystemServiceInterface } from "@/_old_/contract/service/file-system"
import { ensureBraynsApiServiceInterface } from "@/_old_/contract/service/brayns-api/brayns-api"
import { GenerateScriptsForMorphologyCollageServices } from "./scripts-generator/types"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"
import HelpButton from "../../help-button"
import { useAskFoldername } from "../../../user-input/path/foldername"

export interface CollagePreviewPageProps {
    className?: string
    collage: Collage
    onClose(this: void): void
    onSnapshotClick(this: void): void
}

/**
 * Display every slice with the help of a slider.
 */
export default function CollagePreviewPage(props: CollagePreviewPageProps) {
    const modal = useModal()
    const { brayns, fileSystem, scene } = useServiceLocator({
        brayns: ensureBraynsApiServiceInterface,
        fileSystem: ensureFileSystemServiceInterface,
        scene: ensureSceneManagerInterface,
    })
    const { slices } = props.collage
    const [account, setAccount] = useLocalStorageState(
        "proj3",
        "startup-mode-view/account"
    )
    const [outputFolder, setOutputFolder] = useLocalStorageState(
        "",
        "morphology-collage/output-folder"
    )
    const aspectRatio = slices.width / slices.height
    const [snapshotSize, setSnapshotSize] = React.useState<
        [width: number, height: number]
    >([1920, Math.ceil(1920 / aspectRatio)])
    const [cellsDensity, setCellsDensity] = React.useState(
        DEFAULT_COLLAGE_CELLS_DENSITY
    )
    const handleOutputFolderSelect =
        useOutputFolderSelectHandler(setOutputFolder)
    const handleScriptGeneration = makeScriptGenerationHandler(
        modal,
        account,
        cellsDensity,
        outputFolder,
        snapshotSize,
        props,
        {
            brayns,
            fileSystem,
            scene,
        }
    )
    const [handleCanvasClick, eventHitTest] = useCanvasClick()
    return (
        <div className={getClassNames(props)}>
            <AspectRatioKeeperView
                className="main"
                originalWidth={slices.width}
                originalHeight={slices.height}
                margin={16}
            >
                <ImageStreamView
                    className="preview"
                    viewportAutoReset={true}
                    imageStream={scene.imageStream}
                    onClick={handleCanvasClick}
                />
            </AspectRatioKeeperView>
            <menu className="theme-color-screen">
                {/* <img className="thumbnail" src={props.thumbnail} /> */}
                <Button
                    icon="snapshot"
                    label="Snapshot"
                    wide={true}
                    onClick={props.onSnapshotClick}
                />
                <CellDetailView eventHitTest={eventHitTest} brayns={brayns} />
                <SnapshotDimensionsView
                    size={snapshotSize}
                    onChange={setSnapshotSize}
                    aspectRatio={aspectRatio}
                />
                <CellsDensityPerSliceView
                    value={cellsDensity}
                    onChange={setCellsDensity}
                />
                <InputText
                    label="BB5 Account (ex: proj3)"
                    value={account}
                    onChange={setAccount}
                    wide={true}
                />
                <div>
                    <Button
                        wide={true}
                        icon="import"
                        label="Select Folder"
                        onClick={() => void handleOutputFolderSelect()}
                    />
                    {outputFolder && (
                        <div className="output-folder">{outputFolder}</div>
                    )}
                </div>
                <div>
                    {!outputFolder && (
                        <div className="output-folder error">
                            Please select a folder where the images of each
                            slice will be generated.
                        </div>
                    )}
                    <Button
                        wide={true}
                        icon="python"
                        enabled={Boolean(outputFolder)}
                        label="Generate Scripts"
                        onClick={() => void handleScriptGeneration()}
                    />
                </div>
            </menu>
            <SlicesNavigatorView slices={slices} />
            <footer className="theme-color-section">
                <HelpButton label="Help" topic="slices/view" />
                <Button label="Close" onClick={props.onClose} />
            </footer>
        </div>
    )
}

function makeScriptGenerationHandler(
    modal: ModalManagerInterface,
    account: string,
    cellsDensity: number,
    outputFolder: string,
    snapshotSize: [width: number, height: number],
    props: CollagePreviewPageProps,
    services: GenerateScriptsForMorphologyCollageServices
) {
    return async () => {
        try {
            await modal.wait(
                "Generating Python Scripts for Morphology Collage...",
                generateScriptsForMorphologyCollage(
                    {
                        account,
                        cellsPerSlice: cellsDensity,
                        outputFolder,
                        resolution: snapshotSize,
                        slices: props.collage.slices,
                    },
                    services
                )
            )
            await modal.info(
                <div>
                    All the needed files have been sent to{" "}
                    <code>{outputFolder}</code>.<br />
                    Please use the code below to start generating the slices on
                    BB5 with <b>4</b> nodes:
                    <pre>{`ssh bbpv1
cd "${outputFolder}"
chmod a+x activate.sh
./activate.sh 4`}</pre>
                    <p>
                        Generated images will be find in{" "}
                        <code>${outputFolder}/final</code>
                    </p>
                    <hr />
                    Each node will generate a portion of the slices, but they
                    will all load the whole circuit for that.
                    <br />
                    That will increase the traffic on GPFS, therefore slowing
                    down the whole process.
                    <br />
                    So, please, do not use too much nodes.
                </div>
            )
        } catch (ex) {
            await modal.error(ex)
        }
    }
}

function useOutputFolderSelectHandler(
    setOutputFolder: (value: string) => void
) {
    const askFoldername = useAskFoldername()
    return async () => {
        const foldername = await askFoldername({
            title: "Where to store slices images",
        })
        if (!foldername) return

        setOutputFolder(foldername)
    }
}

function getClassNames(props: CollagePreviewPageProps): string {
    const classNames = ["custom", "view-page-CollagePreviewPage"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
