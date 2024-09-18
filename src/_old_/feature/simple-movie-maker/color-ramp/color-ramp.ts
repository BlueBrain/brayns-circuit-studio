import Color from "@/_old_/ui/color"
import { BraynsApiTransferFunction } from "@/_old_/contract/service/brayns-api/brayns-api"
import { half } from "@/_old_/constants"

const WIDTH = 16
const HEIGHT = 256
const CHECKERBOARD_LIGHT_COLOR = "#999"
const CHECKERBOARD_DARK_COLOR = "#666"

export function makeColorRamp(
    transferFunction: BraynsApiTransferFunction
): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext("2d")
    if (!ctx) throw Error("Unable to create a 2D context!")

    paintBackgroundCheckerboard(ctx)
    const colors: string[] = getColors(transferFunction)
    const gradient = ctx.createLinearGradient(0, ctx.canvas.height, 0, 0)
    for (let i = 0; i < colors.length; i++) {
        const offset = i / (colors.length + 1)
        const color = colors[i]
        gradient.addColorStop(offset, color)
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    return canvas
}

/**
 * Add a checkerboard pattern for transparent colors.
 */
function paintBackgroundCheckerboard(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = CHECKERBOARD_DARK_COLOR
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    const SIZE = half(WIDTH)
    ctx.fillStyle = CHECKERBOARD_LIGHT_COLOR
    let even = true
    for (let y = 0; y < HEIGHT; y += SIZE) {
        for (let x = 0; x < WIDTH; x += SIZE) {
            if (even) ctx.fillRect(x, y, SIZE, SIZE)
            even = !even
        }
        even = !even
    }
}

function getColors(transferFunction: BraynsApiTransferFunction): string[] {
    const colors = transferFunction.colors.map(([r, g, b]) =>
        Color.fromArrayRGB([r, g, b]).stringify()
    )
    return colors
}
