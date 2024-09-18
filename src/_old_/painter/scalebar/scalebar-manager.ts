import { getScaleBarSizeAndLabel } from "./size-and-label"
import { half } from "@/_old_/constants"
/* eslint-disable class-methods-use-this */
import ScalebarCanvasPainterInterface, {
    ScalebarCanvasPainterOptions,
} from "@/_old_/contract/painter/scalebar"

type ExplicitPadding = [
    top: number,
    right: number,
    bottom: number,
    left: number,
]
type Padding = number | [number, number] | [number, number, number, number]

export default class ScalebarCanvasPainter extends ScalebarCanvasPainterInterface {
    paint(
        canvas: HTMLCanvasElement,
        preferedWidth: number,
        micrometersPerPixel: number,
        partialOptions: Partial<ScalebarCanvasPainterOptions> = {}
    ): void {
        const options: ScalebarCanvasPainterOptions =
            fillWithDefaultOptions(partialOptions)
        const { label, barWidth } = getScaleBarSizeAndLabel(
            preferedWidth,
            micrometersPerPixel
        )
        const padding = parsePadding(options.padding)
        const [width, height] = computeCanvasFullSize(
            barWidth,
            options,
            padding
        )
        resizeCanvas(canvas, width, height)
        clearBackground(canvas, options.background)
        paintText(canvas, label, padding, options)
        paintBar(canvas, padding, options)
        paintTips(canvas, padding, options)
    }
}

function fillWithDefaultOptions(
    partialOptions: Partial<ScalebarCanvasPainterOptions>
): ScalebarCanvasPainterOptions {
    const DEFAULT_FONTSIZE = 12
    return {
        background: "transparent",
        fontSize: DEFAULT_FONTSIZE,
        gap: half(partialOptions.fontSize ?? DEFAULT_FONTSIZE),
        lineColor: "#fffe",
        lineThickness: 2,
        padding: 0,
        textColor: "#fffe",
        tipsSize: half(partialOptions.fontSize ?? DEFAULT_FONTSIZE),
        tipsStyle: "default",
        ...partialOptions,
    }
}

function parsePadding(padding: Padding): ExplicitPadding {
    if (typeof padding === "number") {
        return [padding, padding, padding, padding]
    }
    const VERTICAL_HORIZONTAL_SYNTAX = 2
    if (padding.length === VERTICAL_HORIZONTAL_SYNTAX) {
        const [vertical, horizontal] = padding
        return [vertical, horizontal, vertical, horizontal]
    }
    return padding
}
function computeCanvasFullSize(
    barWidth: number,
    options: ScalebarCanvasPainterOptions,
    padding: ExplicitPadding
): [width: number, height: number] {
    const [padTop, padRight, padBottom, padLeft] = padding
    const width = padLeft + barWidth + padRight
    const height =
        padTop +
        options.fontSize +
        options.gap +
        computeTipSizeBelowBar(options) +
        padBottom
    return [width, height]
}

function resizeCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
) {
    canvas.setAttribute("width", `${width}`)
    canvas.setAttribute("height", `${height}`)
}

function clearBackground(canvas: HTMLCanvasElement, background: string) {
    const ctx = getCanvasContext(canvas)
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)
    if (background !== "transparent") {
        ctx.fillStyle = background
        ctx.fillRect(0, 0, width, height)
    }
}

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw Error("Unable to get the 2D context of a canvas!")

    return ctx
}

/**
 * Depending on the tips style and size, we will need extra space below the bar.
 */
function computeTipSizeBelowBar(options: ScalebarCanvasPainterOptions): number {
    switch (options.tipsStyle) {
        case "default":
            return options.tipsSize
        default:
            // Nothing has to be displayed below the bar.
            return 0
    }
}

function paintText(
    canvas: HTMLCanvasElement,
    label: string,
    padding: ExplicitPadding,
    options: ScalebarCanvasPainterOptions
) {
    const ctx = getCanvasContext(canvas)
    ctx.font = `${options.fontSize}px sans-serif`
    const measure = ctx.measureText(label)
    const [padTop] = padding
    const x = half(canvas.width - measure.width)
    const y = padTop + options.fontSize
    ctx.fillStyle = options.textColor
    ctx.fillText(label, x, y)
}

function paintBar(
    canvas: HTMLCanvasElement,
    padding: ExplicitPadding,
    options: ScalebarCanvasPainterOptions
) {
    const ctx = getCanvasContext(canvas)
    const [padTop, padRight, _padBottom, padLeft] = padding
    const x1 = padLeft
    const x2 = canvas.width - padRight
    const y =
        padTop + options.fontSize + options.gap - half(options.lineThickness)
    ctx.lineWidth = options.lineThickness
    ctx.strokeStyle = options.textColor
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(x1, y)
    ctx.lineTo(x2, y)
    ctx.stroke()
}

function paintTips(
    canvas: HTMLCanvasElement,
    padding: ExplicitPadding,
    options: ScalebarCanvasPainterOptions
): void {
    switch (options.tipsStyle) {
        case "default":
            paintTipsDefault(canvas, padding, options)
            break
        default:
    }
}

/**
 * Paint something like that: `|-----|`
 */
function paintTipsDefault(
    canvas: HTMLCanvasElement,
    padding: ExplicitPadding,
    options: ScalebarCanvasPainterOptions
): void {
    const ctx = getCanvasContext(canvas)
    const [padTop, padRight, _padBottom, padLeft] = padding
    const x1 = padLeft + half(options.lineThickness)
    const x2 = canvas.width - padRight - half(options.lineThickness)
    const y =
        padTop + options.fontSize + options.gap - half(options.lineThickness)
    ctx.lineWidth = options.lineThickness
    ctx.strokeStyle = options.textColor
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(x1, y - options.tipsSize)
    ctx.lineTo(x1, y + options.tipsSize)
    ctx.moveTo(x2, y - options.tipsSize)
    ctx.lineTo(x2, y + options.tipsSize)
    ctx.stroke()
}
