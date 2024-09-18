import { ColorRampCanvasPainterOptions } from "@/_old_/contract/painter/color-ramp"
import { ScalebarCanvasPainterOptions } from "@/_old_/contract/painter/scalebar"
import { SnapshotParams } from "../snapshot-params-input"

export interface RawSnapshot extends SnapshotParams {
    snapshotFromBrayns: HTMLImageElement
}

export interface CompositorCanvases {
    main: HTMLCanvasElement
    colorramp: HTMLCanvasElement
    scalebar: HTMLCanvasElement
    /** Mostly used for WebGL meshes. */
    overlay: HTMLCanvasElement
}

export interface ScalebarConfig extends ScalebarCanvasPainterOptions {
    enabled: boolean
    separatedFile: boolean
}

export interface ColorRampConfig extends ColorRampCanvasPainterOptions {
    enabled: boolean
    separatedFile: boolean
}
