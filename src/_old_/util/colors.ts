/**
 *
 * @param background Color of the background. Opacity is ignored.
 * @param colors Candidates colors for text to be displayed on the `background`.
 * Opacity will be used for blending with the `background`.
 * @returns The element of `colors` which has the best contrast with the `background`.
 * @example
 * ```tsx
 * const background = painter.colors.background
 * const { body } = document
 * body.style.backgroundColor = background
 * body.style.color = colorContrast(background, "#000d", "#fffd")
 * ```
 */
export function colorContrast(background: string, ...colors: string[]) {
    const [backR, backG, backB] = colorToRGBA(background)
    const backLum = colorLuminance(backR, backG, backB)
    let bestColor = background
    let bestContract = 0
    for (const color of colors) {
        const [foreR, foreG, foreB, foreA] = colorToRGBA(color)
        const foreLum = colorLuminance(
            foreA * foreR + (1 - foreA) * backR,
            foreA * foreG + (1 - foreA) * backG,
            foreA * foreB + (1 - foreA) * backB
        )
        const L1 = Math.max(backLum, foreLum)
        const L2 = Math.min(backLum, foreLum)
        const contrast = (L1 + 0.05) / (L2 + 0.05)
        if (contrast > bestContract) {
            bestContract = contrast
            bestColor = color
        }
    }
    return bestColor
}

/**
 * Compute luninance in sRGB space.
 * @param red Float between 0.0 and 1.0
 * @param green Float between 0.0 and 1.0
 * @param blue Float between 0.0 and 1.0
 */
export function colorLuminance(
    red: number,
    green: number,
    blue: number
): number {
    const t = 0.04045
    const a = 1 / 12.92
    const b = 0.055
    const c = 1 / 1.055
    const gamma = 2.4
    const convert = (v: number) =>
        v <= t ? v * a : Math.pow((v + b) * c, gamma)
    const R = convert(red)
    const G = convert(green)
    const B = convert(blue)
    return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/**
 * @param color CSS color string
 * @returns The 4 components of a color in floats between 0.0 and 1.0
 */
export function colorToRGBA(
    color: string
): [red: number, green: number, blue: number, alpha: number] {
    const ctx = getContext()
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const bitmap = ctx.getImageData(0, 0, 1, 1)
    const [R, G, B, A] = bitmap.data
    return [R / 255, G / 255, B / 255, A / 255]
}

let globalContext: CanvasRenderingContext2D | null = null

function getContext(): CanvasRenderingContext2D {
    if (!globalContext) {
        const canvas: HTMLCanvasElement = document.createElement("canvas")
        canvas.width = 1
        canvas.height = 1
        const ctx = canvas.getContext("2d", {
            alpha: true,
            willReadFrequently: true,
        })
        if (!ctx) throw Error("Unable to create a 2D context!")

        globalContext = ctx
    }
    return globalContext
}
