import * as React from "react"
import ColorRampCanvasPainterInterface from "@/_old_/contract/painter/color-ramp"
import ParamsView from "./params/params-view"
import PreviewView from "./preview/preview-view"
import ScalebarCanvasPainterInterface from "@/_old_/contract/painter/scalebar"
import { BraynsApiTransferFunction } from "@/_old_/contract/service/brayns-api/brayns-api"
import { ColorRampConfig, CompositorCanvases, RawSnapshot } from "./types"
import { ScalebarConfig } from "./types"
import { Snapshot } from "@/_old_/contract/feature/snapshot"
import "./snapshot-compositor-view.css"

export interface SnapshotCompositorViewProps {
    className?: string
    params: RawSnapshot
    transferFunction?: BraynsApiTransferFunction
    colorrampPainter: ColorRampCanvasPainterInterface
    scalebarPainter: ScalebarCanvasPainterInterface
    onOK(this: void, snapshots: Snapshot[]): void
    onCancel(): void
}

export default function SnapshotCompositorView(
    props: SnapshotCompositorViewProps
) {
    const { params, colorrampPainter, scalebarPainter } = props
    const [canvases, setCanvases] = React.useState<CompositorCanvases | null>(
        null
    )
    const [scalebarConfig, setScalebarConfig] = React.useState<ScalebarConfig>({
        enabled: true,
        separatedFile: false,
        background: "transparent",
        fontSize: 12,
        gap: 6,
        lineColor: "#fffe",
        lineThickness: 2,
        padding: 2,
        textColor: "#fffe",
        tipsSize: 6,
        tipsStyle: "default",
    })
    const [colorrampConfig, setColorrampConfig] = React.useState<
        ColorRampConfig | undefined
    >(makeInitialColorRampConfig(props))
    return (
        <div className={getClassNames(props)}>
            <PreviewView
                params={params}
                colorrampPainter={colorrampPainter}
                colorrampConfig={colorrampConfig}
                scalebarPainter={scalebarPainter}
                scalebarConfig={scalebarConfig}
                onCanvasesCreated={setCanvases}
            />
            {canvases && (
                <ParamsView
                    params={params}
                    canvases={canvases}
                    colorrampConfig={colorrampConfig}
                    onColorrampConfigChange={setColorrampConfig}
                    scalebarConfig={scalebarConfig}
                    onScalebarConfigChange={setScalebarConfig}
                    onSave={props.onOK}
                />
            )}
        </div>
    )
}

function getClassNames(props: SnapshotCompositorViewProps): string {
    const classNames = ["custom", "feature-snapshot-SnapshotCompositorView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function makeInitialColorRampConfig(
    props: SnapshotCompositorViewProps
): ColorRampConfig | undefined {
    if (!props.transferFunction) return

    const options = props.colorrampPainter.completeDefaultValues({
        transferFunction: props.transferFunction,
        barThickness: proportion(32, 1920, props.params.width),
        barLength: proportion(256, 1080, props.params.height),
        fontSize: proportion(18, 1080, props.params.height),
        padding: proportion(8, 1080, props.params.height),
        showRange: "right",
        intermediaryStepCount: 0,
        showUnit: "top",
        unit: "mV",
    })
    return {
        ...options,
        enabled: true,
        separatedFile: false,
    }
}

function proportion(value: number, from: number, to: number): number {
    return Math.round((value * to) / from)
}
