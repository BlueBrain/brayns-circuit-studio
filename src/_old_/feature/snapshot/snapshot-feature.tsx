import ColorRampCanvasPainterInterface, {
    ensureColorRampCanvasPainterInterface,
} from "@/_old_/contract/painter/color-ramp"
import Dialog from "@/_old_/ui/view/dialog"
import React from "react"
import ScalebarCanvasPainterInterface, {
    ensureScalebarCanvasPainterInterface,
} from "@/_old_/contract/painter/scalebar"
import SceneManagerInterface, {
    ensureSceneManagerInterface,
} from "@/_old_/contract/manager/scene"
import SnapshotCompositor from "./snapshot-compositor/snapshot-compositor-view"
import SnapshotFeatureInterface, {
    Snapshot,
} from "@/_old_/contract/feature/snapshot"
import SnapshotParamsInput, { SnapshotParams } from "./snapshot-params-input"
import { BraynsSnapshotQualityEnum } from "@/_old_/contract/service/brayns-api/snapshot"
import { RawSnapshot } from "./snapshot-compositor/types"
import "./snapshot-feature.css"
import BraynsApiServiceInterface, {
    BraynsApiTransferFunction,
    ensureBraynsApiServiceInterface,
} from "@/_old_/contract/service/brayns-api/brayns-api"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"
import { useModal } from "@/_old_/ui/modal"
import { useServiceLocator } from "@/_old_/tool/locator"
import FileSaverInterface, {
    ensureFileSaverInterface,
} from "@/_old_/contract/manager/file-saver"

const PREVIEW_MAX_WIDTH = 240

export function useSnapshot(): SnapshotFeatureInterface {
    const modal = useModal()
    const { brayns, scene, scalebarPainter, colorrampPainter, fileSaver } =
        useServiceLocator({
            brayns: ensureBraynsApiServiceInterface,
            scene: ensureSceneManagerInterface,
            scalebarPainter: ensureScalebarCanvasPainterInterface,
            colorrampPainter: ensureColorRampCanvasPainterInterface,
            fileSaver: ensureFileSaverInterface,
        })
    return React.useMemo(
        () =>
            new SnapshotFeature(
                brayns,
                scene,
                scalebarPainter,
                colorrampPainter,
                fileSaver,
                modal
            ),
        [brayns, scene, scalebarPainter, colorrampPainter, fileSaver, modal]
    )
}

class SnapshotFeature extends SnapshotFeatureInterface {
    constructor(
        private readonly api: BraynsApiServiceInterface,
        private readonly scene: SceneManagerInterface,
        private readonly scalebarPainter: ScalebarCanvasPainterInterface,
        private readonly colorrampPainter: ColorRampCanvasPainterInterface,
        private readonly fileSaver: FileSaverInterface,
        private readonly modal: ModalManagerInterface
    ) {
        super()
    }

    /**
     * Open a dialog box for the user to enter snapshot
     * name, dimension and quality.
     * Can return `null` if the user cancelled the operation.
     */
    async takeInteractiveSnapshot(): Promise<Snapshot[] | null> {
        const rawSnapshot = await this.takeRawSnapshot()
        if (!rawSnapshot) return null

        const snapshots = await this.applyCompositor(rawSnapshot)
        if (!snapshots) return null

        const { modal, fileSaver } = this
        await modal.wait(
            `Saving ${snapshots
                .map((snapshot) => snapshot.filename)
                .join(", ")}...`,
            saveSnapshots(snapshots, fileSaver)
        )
        await modal.info(
            <div>
                <p>
                    Depending on your browser's configuration,
                    {snapshots.length > 1
                        ? "snapshots have been"
                        : "the snapshot has been"}{" "}
                    saved
                    <br />
                    in the <b>download</b> folder or opened in an image viewer.
                </p>
                <ul>
                    {snapshots.map(({ filename, canvas }) => (
                        <li key={filename}>
                            <code>{filename}</code> ({canvas.width}x
                            {canvas.height})
                        </li>
                    ))}
                </ul>
            </div>,
            {
                align: "T",
            }
        )
        return snapshots
    }

    private async applyCompositor(
        rawSnapshot: RawSnapshot
    ): Promise<Snapshot[] | null> {
        const { modal, colorrampPainter, scalebarPainter } = this
        const transferFunction = await this.findTransferFunction()
        return new Promise((resolve) => {
            const hide = modal.show({
                padding: 0,
                content: (
                    <SnapshotCompositor
                        params={rawSnapshot}
                        transferFunction={transferFunction}
                        colorrampPainter={colorrampPainter}
                        scalebarPainter={scalebarPainter}
                        onOK={(finalSnapshots: Snapshot[]) => {
                            hide()
                            resolve(finalSnapshots)
                        }}
                        onCancel={() => {
                            hide()
                            resolve(null)
                        }}
                    />
                ),
            })
        })
    }

    private async findTransferFunction(): Promise<
        undefined | BraynsApiTransferFunction
    > {
        const { api, scene } = this
        const circuits = await scene.models.circuit.getItems()
        for (const circuit of circuits) {
            if (!circuit.report || circuit.report.name === "none") continue

            for (const modelId of circuit.modelIds) {
                const ts = await api.getModelTransferFunction(modelId)
                if (ts) return ts
            }
        }
        return
    }

    /**
     * The first step is to get an image from Brayns.
     * We call it the raw snapshot, and we will pass it
     * to the compositor.
     */
    private async takeRawSnapshot(): Promise<RawSnapshot | null> {
        const { api, modal } = this
        return new Promise((resolve) => {
            let params: SnapshotParams = {
                width: 1920,
                height: 1080,
                name: `snapshot`,
                transparentBackground: false,
                quality: BraynsSnapshotQualityEnum.High,
                cameraHeight: this.scene.camera.getHeightAtTarget(),
            }
            const hide = modal.show({
                content: (
                    <Dialog
                        title="Take a Snapshot of the current scene"
                        labelOK="Proceed"
                        onCancel={() => {
                            hide()
                            resolve(null)
                        }}
                        onOK={() => {
                            hide()
                            void handleProceedButtonClick(
                                modal,
                                api,
                                params,
                                resolve
                            )
                        }}
                    >
                        <SnapshotParamsInput
                            value={params}
                            fastSnapshot={makeFastSnapshotFunction(api)}
                            onChange={(v) => (params = v)}
                        />
                    </Dialog>
                ),
            })
        })
    }
}

function makeFastSnapshotFunction(
    brayns: BraynsApiServiceInterface
): (opts: SnapshotParams) => Promise<HTMLImageElement> {
    return async (opts: SnapshotParams) =>
        brayns.snapshot.takeImage({
            transparent: opts.transparentBackground,
            size: fit(opts.width, opts.height, PREVIEW_MAX_WIDTH),
            quality: BraynsSnapshotQualityEnum.Low,
        })
}

async function handleProceedButtonClick(
    modal: ModalManagerInterface,
    api: BraynsApiServiceInterface,
    params: SnapshotParams,
    resolve: (value: RawSnapshot | null) => void
) {
    const image = await api.snapshot.takeImageWithCancelOption(
        {
            transparent: params.transparentBackground,
            size: [params.width, params.height],
            quality: params.quality,
        },
        modal
    )
    if (!image) {
        resolve(null)
        return
    } else
        resolve({
            ...params,
            snapshotFromBrayns: image,
        })
}

/**
 * Return the dimension of a rectangle of aspect ratio `width`/`height`
 * that can fit in a square of `maxSize` side.
 */
function fit(width: number, height: number, maxSize: number): [number, number] {
    const factorWidth = maxSize / width
    const factorHeight = maxSize / height
    const factor = Math.min(factorWidth, factorHeight)
    return [Math.ceil(width * factor), Math.ceil(height * factor)]
}

async function saveSnapshots(
    snapshots: Snapshot[],
    fileSaver: FileSaverInterface
): Promise<void> {
    const loadTasks = snapshots.map((snapshot) =>
        fileSaver.saveCanvas(snapshot.canvas, snapshot.filename)
    )
    await Promise.all(loadTasks)
}
