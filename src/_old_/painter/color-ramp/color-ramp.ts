import { BraynsApiTransferFunction } from "@/_old_/contract/service/brayns-api/brayns-api"
import { isArray } from "@math.gl/core"
import ColorRampCanvasPainterInterface, {
    ColorRampCanvasPainterOptions,
} from "@/_old_/contract/painter/color-ramp"

interface ExtendedColorRampCanvasPainterOptions
    extends ColorRampCanvasPainterOptions {
    minLabel: string
    maxLabel: string
    padTop: number
    padRight: number
    padBottom: number
    padLeft: number
}

export default class ColorRampCanvasPainter extends ColorRampCanvasPainterInterface {
    paint(
        canvas: HTMLCanvasElement,
        options: Partial<ColorRampCanvasPainterOptions> & {
            transferFunction: BraynsApiTransferFunction
        }
    ): void {
        const config = this.extendConfig(this.completeDefaultValues(options))
        const ctx = canvas.getContext("2d", { alpha: true })
        if (!ctx) throw Error("Unable to create a 2D context!")

        ctx.font = `${config.fontSize}px sans-serif`
        const [x0, y0, width, height] = computeDimensions(ctx, config)
        resetCanvas(ctx, width, height, x0, y0, config)
        paintColors(ctx, x0, y0, config)
        paintColorsBorder(ctx, x0, y0, config)
        paintLabels(ctx, x0, y0, config)
    }

    completeDefaultValues(
        options: Partial<ColorRampCanvasPainterOptions> & {
            transferFunction: BraynsApiTransferFunction
        }
    ): ColorRampCanvasPainterOptions {
        const { fontSize } = options
        const fullOptions: ColorRampCanvasPainterOptions = {
            background: "#0000",
            barLength: 256,
            barThickness: 16,
            fontSize: 12,
            gap: fontSize ?? 12,
            minLineWidth: 2,
            intermediaryStepCount: 2,
            padding: 0,
            showRange: "right",
            showUnit: "inline",
            textColor: "#fff",
            unit: "",
            ...options,
        }
        return fullOptions
    }

    private extendConfig(
        options: ColorRampCanvasPainterOptions
    ): ExtendedColorRampCanvasPainterOptions {
        const pad: number[] = (
            isArray(options.padding) ? options.padding : [options.padding]
        ) as number[]
        return {
            ...options,
            minLabel: `${Math.min(
                options.transferFunction.range.min,
                options.transferFunction.range.max
            )}${options.showUnit === "inline" ? ` ${options.unit}` : ""}`,
            maxLabel: `${Math.max(
                options.transferFunction.range.max,
                options.transferFunction.range.min
            )}${options.showUnit === "inline" ? ` ${options.unit}` : ""}`,
            padTop: pad[0] ?? 0,
            padRight: pad[1 % pad.length] ?? 0,
            padBottom: pad[2 % pad.length] ?? 0,
            padLeft: pad[3 % pad.length] ?? 0,
        }
    }
}

function computeDimensions(
    ctx: CanvasRenderingContext2D,
    config: ExtendedColorRampCanvasPainterOptions
): [barX: number, barY: number, canvasWidth: number, canvasHeight: number] {
    const {
        gap,
        fontSize,
        barLength,
        barThickness,
        showUnit,
        showRange,
        padTop,
        padRight,
        padBottom,
        padLeft,
        minLabel,
        maxLabel,
    } = config
    let x = 0
    let y = 0
    let width = barThickness
    let height = barLength
    switch (showUnit) {
        case "bottom":
            height += gap + fontSize
            break
        case "top":
            height += gap + fontSize
            y += gap + fontSize
            break
    }
    if (showRange === "right") {
        const rightMargin =
            Math.max(
                ctx.measureText(minLabel).width,
                ctx.measureText(maxLabel).width
            ) + gap
        width += rightMargin
    } else if (showRange === "left") {
        const leftMargin =
            Math.max(
                ctx.measureText(minLabel).width,
                ctx.measureText(maxLabel).width
            ) + gap
        width += leftMargin
        x += leftMargin
    }
    return [
        x + padLeft,
        y + padTop,
        width + padLeft + padRight,
        height + padTop + padBottom,
    ]
}

const CHECKERBOARD_LIGHT_COLOR = "#999"
const CHECKERBOARD_DARK_COLOR = "#666"

/**
 * Set canvas dimensions, clear with the background color and
 * paint a checkerboard on the colorramp to represent transparency.
 */
function resetCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    ctx.canvas.style.width = `${width}px`
    ctx.canvas.style.height = `${height}px`
    ctx.canvas.width = width
    ctx.canvas.height = height
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = config.background
    ctx.fillRect(0, 0, width, height)
    paintBackgroundCheckerboard(
        ctx,
        x0,
        y0,
        config.barThickness,
        config.barLength
    )
}

/**
 * Add a checkerboard pattern for transparent colors.
 */
function paintBackgroundCheckerboard(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    width: number,
    height: number
) {
    ctx.fillStyle = CHECKERBOARD_DARK_COLOR
    ctx.fillRect(x0, y0, width, height)
    ctx.fillStyle = CHECKERBOARD_LIGHT_COLOR

    const SQUARES_PER_ROW = 3
    const SQUARE_SIDE = width / SQUARES_PER_ROW
    const squaresVertically = Math.ceil(height / SQUARE_SIDE)

    for (let row = 0; row < squaresVertically; row++) {
        for (let col = 0; col < SQUARES_PER_ROW; col++) {
            if (col % 2 === row % 2) {
                continue
            }
            const x = x0 + col * SQUARE_SIDE
            const y = y0 + row * SQUARE_SIDE
            const w = SQUARE_SIDE
            let h = SQUARE_SIDE
            if (y + h > y0 + height) {
                h -= y + h - (y0 + height)
            }
            ctx.fillRect(x, y, w, h)
        }
    }
}

/**
 * Paint the colors gradient for the transfer function.
 */
function paintColors(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    const hexaColors: string[] = config.transferFunction.colors.map(toHexaColor)
    const gradient = ctx.createLinearGradient(0, ctx.canvas.height, 0, 0)
    for (let i = 0; i < hexaColors.length; i++) {
        const offset = i / (hexaColors.length + 1)
        const color = hexaColors[i]
        gradient.addColorStop(offset, color)
    }
    ctx.fillStyle = gradient
    ctx.fillRect(x0, y0, config.barThickness, config.barLength)
}

/**
 * Paint a thin border around the gradient.
 */
function paintColorsBorder(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    ctx.save()
    ctx.lineWidth = Math.max(
        config.minLineWidth,
        Math.floor(config.barThickness / 24)
    )
    ctx.strokeStyle = config.textColor
    ctx.beginPath()
    ctx.rect(x0, y0, config.barThickness, config.barLength)
    ctx.stroke()
    ctx.restore()
}

function toHexaColor([r, g, b, a]: [number, number, number, number]): string {
    return `#${toFF(r)}${toFF(g)}${toFF(b)}${toFF(a)}`
}

function toFF(value: number): string {
    if (value <= 0) return "00"
    if (value >= 1) return "FF"
    const int = Math.floor(255 * value)
    const txt = int.toString(16)
    if (txt.length < 2) return `0${txt}`
    return txt
}

/**
 * Paint the range labels if needed.
 */
function paintLabels(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    ctx.font = `${config.fontSize}px sans-serif`
    ctx.fillStyle = config.textColor
    paintUnitLabel(ctx, x0, y0, config)
    paintRangeLabel(ctx, x0, y0, config)
}

function paintUnitLabel(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    if (config.showUnit === "bottom") paintUnitLabelBottom(ctx, x0, y0, config)
    else if (config.showUnit === "top") paintUnitLabelTop(ctx, x0, y0, config)
}

function paintUnitLabelBottom(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    const { unit, barThickness, barLength, gap, fontSize } = config
    const x = x0 + (barThickness - ctx.measureText(unit).width) / 2
    const y = y0 + barLength + gap + fontSize
    ctx.fillText(unit, x, y)
}

function paintUnitLabelTop(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    const { unit, barThickness, gap } = config
    const x = x0 + (barThickness - ctx.measureText(unit).width) / 2
    const y = y0 - gap
    ctx.fillText(unit, x, y)
}

function paintRangeLabel(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    if (config.showRange === "right") paintRangeLabelRight(ctx, x0, y0, config)
    else if (config.showRange === "left")
        paintRangeLabelLeft(ctx, x0, y0, config)
}

function paintRangeLabelLeft(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    console.log("🚀 [color-ramp] config = ", config) // @FIXME: Remove this line written on 2023-11-23 at 15:08
    const { gap, fontSize, minLabel, maxLabel, barLength } = config
    const xMax = x0 - gap - ctx.measureText(maxLabel).width
    const yMax = y0 + fontSize
    ctx.fillText(maxLabel, xMax, yMax)
    const xMin = x0 - gap - ctx.measureText(minLabel).width
    const yMin = y0 + barLength
    ctx.fillText(minLabel, xMin, yMin)
}

function paintRangeLabelRight(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    config: ExtendedColorRampCanvasPainterOptions
) {
    console.log("🚀 [color-ramp] config = ", config) // @FIXME: Remove this line written on 2023-11-23 at 15:08
    const { gap, fontSize, barThickness, barLength, intermediaryStepCount } =
        config
    const labelX = x0 + barThickness + gap
    const tickX = x0 + barThickness
    const intermediaryValues: number[] = []
    const maxValue = Math.max(
        config.transferFunction.range.min,
        config.transferFunction.range.max
    )
    const minValue = Math.min(
        config.transferFunction.range.min,
        config.transferFunction.range.max
    )
    const valueRange = maxValue - minValue
    const intermediaryValueStep = Math.round(
        valueRange / (intermediaryStepCount + 1)
    )

    for (let i = 0; i < intermediaryStepCount; i++) {
        intermediaryValues.push(minValue + intermediaryValueStep * (i + 1))
    }

    const values = [minValue, ...intermediaryValues, maxValue]
    const tickThickness = Math.max(
        config.minLineWidth,
        Math.floor(config.barThickness / 24)
    )
    for (const value of values) {
        const label = `${value}${
            config.showUnit === "inline" ? ` ${config.unit}` : ""
        }`
        const alpha = (value - minValue) / (maxValue - minValue)
        const valueY = Math.round(y0 + barLength - alpha * barLength)
        const labelY = valueY + fontSize / 4
        ctx.fillText(label, labelX, labelY)
        ctx.fillRect(tickX, valueY - tickThickness / 2, 10, tickThickness)
    }
}
