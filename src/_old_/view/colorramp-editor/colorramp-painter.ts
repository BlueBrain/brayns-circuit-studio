import Color from "@/_old_/ui/color"
import Gesture, { ColorRampGestureEvent } from "./colorramp-gesture"
import { clamp, EMPTY_FUNCTION, HALF, half, NOT_FOUND } from "@/_old_/constants"
import { Vector3 } from "@/_old_/contract/tool/calc"

const LEFT_MARGIN = 8
const RIGHT_MARGIN = 8
const TOP_MARGIN = 8
const BOTTOM_MARGIN = 24
const MARKER_WIDTH = 6
const MARKER_HEIGHT = 22
const PATTERN_SIZE = 16
const PATTERN_COLOR1 = "#aaa"
const PATTERN_COLOR2 = "#777"

const DEFAULT_COLORS: ColorRampStep[] = [
    { color: [1, 0.6, 0], offset: 0, transparentSection: false },
    { color: [0, 1, 0], offset: 0.3, transparentSection: true },
    { color: [1, 1, 0], offset: 0.4, transparentSection: false },
    { color: [0, 0.6, 1], offset: 1, transparentSection: false },
]

export interface ColorRampStep {
    color: Vector3
    /** Value between 0 and 1 */
    offset: number
    /** Is the following section full transparent? */
    transparentSection: boolean
}

export default class ColorRampPainter {
    /**
     * Callback for when a marker has been slided.
     */
    public onChange: (colors: ColorRampStep[]) => void = EMPTY_FUNCTION

    /**
     * Callback for when the user clicked on a marker.
     */
    public onSelect: (colorIndex: number) => void = EMPTY_FUNCTION

    private _canvas: HTMLCanvasElement | null = null
    private readonly resizeObserver: ResizeObserver
    private pattern: CanvasPattern | null = null
    private _colors: ColorRampStep[] = []
    private readonly gesture: Gesture
    private indexOfMovingMarker = NOT_FOUND

    constructor(colors: ColorRampStep[] = DEFAULT_COLORS) {
        this.resizeObserver = new ResizeObserver(this.handleResize)
        this.colors = colors
        this.gesture = new Gesture(
            this.handleDown,
            this.handleMove,
            this.handleUp,
            this.handleSelect,
            LEFT_MARGIN,
            RIGHT_MARGIN
        )
    }

    get colors() {
        return this._colors
    }
    set colors(value: ColorRampStep[]) {
        if (value.length < 1) return

        console.log("🚀 [colorramp-painter] value = ", value) // @FIXME: Remove this line written on 2024-06-05 at 16:25
        this._colors = [...value]
        this._colors.sort((a, b) => a.offset - b.offset)
        if (this._colors.length === 1) this._colors.push({ ...this._colors[0] })
        this._colors[0].offset = 0
        this._colors[this._colors.length - 1].offset = 1
        this.paint()
    }

    get canvas() {
        return this._canvas
    }
    set canvas(value: HTMLCanvasElement | null) {
        if (this._canvas === value) return

        if (this._canvas) {
            // Stop observing previous canvas
            this.resizeObserver.unobserve(this._canvas)
        }
        this._canvas = value
        this.gesture.canvas = value
        if (value) {
            this.createBackgroundPattern()
            this.resizeObserver.observe(value)
            this.handleResize()
        }
    }

    /**
     * @returns Current Canvas context or null if no one is available.
     */
    private get ctx(): CanvasRenderingContext2D | null {
        const { canvas } = this
        if (!canvas) return null

        return canvas.getContext("2d")
    }

    private paint() {
        window.requestAnimationFrame(this.actualPaint)
    }

    private readonly actualPaint = () => {
        const { ctx } = this
        if (!ctx) return

        const { width, height } = ctx.canvas
        ctx.clearRect(0, 0, width, height)
        this.paintBackground(ctx)
        this.paintGradient(ctx)
        this.paintMarkers(ctx)
    }

    private paintBackground(ctx: CanvasRenderingContext2D) {
        const { width, height } = ctx.canvas
        ctx.fillStyle = this.pattern ?? "#000"
        ctx.beginPath()
        ctx.rect(
            LEFT_MARGIN - HALF,
            TOP_MARGIN - HALF,
            width - LEFT_MARGIN - RIGHT_MARGIN,
            height - TOP_MARGIN - BOTTOM_MARGIN
        )
        ctx.fill()
    }

    private paintGradient(ctx: CanvasRenderingContext2D) {
        const { width, height } = ctx.canvas
        ctx.lineWidth = 1
        ctx.strokeStyle = "#000"
        const x = LEFT_MARGIN - HALF
        const y = TOP_MARGIN - HALF
        const grad = ctx.createLinearGradient(x, y, width - RIGHT_MARGIN, y)
        const colorStops: Array<[offset: number, color: string]> =
            makeGradientColorStops(this.colors)
        for (const [offset, color] of colorStops) {
            grad.addColorStop(offset, color)
        }
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.rect(
            x,
            y,
            width - LEFT_MARGIN - RIGHT_MARGIN,
            height - TOP_MARGIN - BOTTOM_MARGIN
        )
        ctx.fill()
        ctx.stroke()
    }

    private paintMarkers(ctx: CanvasRenderingContext2D) {
        const { width, height } = ctx.canvas
        ctx.lineWidth = 1
        ctx.strokeStyle = "#000"
        const y = height - BOTTOM_MARGIN - HALF - MARKER_WIDTH
        const w = width - LEFT_MARGIN - RIGHT_MARGIN
        for (const { color, offset } of this.colors) {
            const [red, green, blue] = color
            ctx.fillStyle = Color.fromRGB(red, green, blue).stringify()
            const x = LEFT_MARGIN + HALF + Math.floor(w * offset)
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x - MARKER_WIDTH, y + MARKER_HEIGHT)
            ctx.lineTo(x + MARKER_WIDTH, y + MARKER_HEIGHT)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
    }

    private readonly handleResize = () => {
        const { canvas } = this
        if (!canvas) return

        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        this.paint()
    }

    /**
     * To represent opacity, we need a checkerboard background.
     */
    private createBackgroundPattern() {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = PATTERN_SIZE
        canvas.height = PATTERN_SIZE
        ctx.fillStyle = PATTERN_COLOR1
        ctx.fillRect(0, 0, PATTERN_SIZE, PATTERN_SIZE)
        ctx.fillStyle = PATTERN_COLOR2
        ctx.beginPath()
        const haflSize = half(PATTERN_SIZE)
        ctx.rect(0, 0, haflSize, haflSize)
        ctx.rect(haflSize, haflSize, haflSize, haflSize)
        ctx.fill()
        this.pattern = ctx.createPattern(canvas, "repeat")
    }

    private findIndexOfNearestMarker(
        x: number
    ): [index: number, distance: number] {
        let bestIndex = NOT_FOUND
        let bestDistance = 1
        let index = 0
        for (const { offset } of this._colors) {
            const distance = x - offset
            if (Math.abs(distance) < Math.abs(bestDistance)) {
                bestDistance = distance
                bestIndex = index
            }
            index++
        }
        return [bestIndex, bestDistance]
    }

    private readonly handleDown = (evt: ColorRampGestureEvent) => {
        const { canvas } = this
        if (!canvas) return

        const markerMinimalDistDetection =
            MARKER_WIDTH / (canvas.clientWidth - LEFT_MARGIN - RIGHT_MARGIN)
        const [index, distance] = this.findIndexOfNearestMarker(evt.x)
        if (Math.abs(distance) > markerMinimalDistDetection) {
            // Pointer down but not on a marker.
            // So we need to create a new one right here.
            const prevIndex = distance < 0 ? index - 1 : index
            const nextIndex = prevIndex + 1
            const { colors } = this
            const prevStep = colors[prevIndex]
            const nextStep = colors[nextIndex]
            const alpha =
                (evt.x - prevStep.offset) / (nextStep.offset - prevStep.offset)
            colors.splice(nextIndex, 0, {
                color: Color.mix(
                    Color.fromRGB(...prevStep.color),
                    Color.fromRGB(...nextStep.color),
                    alpha
                ).toArrayRGB(),
                offset: evt.x,
                transparentSection: false,
            })
            this.paint()
            this.onChange([...colors])
        } else {
            this.indexOfMovingMarker = index
        }
    }

    private readonly handleMove = (evt: ColorRampGestureEvent) => {
        const index = this.indexOfMovingMarker
        const { colors } = this
        if (index < 1 || index >= colors.length - 1) return

        const min = colors[index - 1].offset
        const max = colors[index + 1].offset
        colors[index].offset = clamp(evt.x, min, max)
        this.paint()
    }

    private readonly handleUp = () => {
        const index = this.indexOfMovingMarker
        const { colors } = this
        if (index < 1 || index >= colors.length - 1) return

        const EPSILON = 1e-4
        const previousOffset = colors[index - 1].offset
        const currentOffset = colors[index].offset
        const nextOffset = colors[index + 1].offset
        const distanceWithPreviousMarker = Math.abs(
            previousOffset - currentOffset
        )
        const distanceWithNextMarker = Math.abs(nextOffset - currentOffset)
        if (
            distanceWithPreviousMarker < EPSILON ||
            distanceWithNextMarker < EPSILON
        ) {
            // This marker collapses with a neighbor, so we remove it.
            colors.splice(index, 1)
            this.paint()
        }
        this.onChange([...colors])
    }

    private readonly handleSelect = () => {
        const index = this.indexOfMovingMarker
        if (index === NOT_FOUND) return

        this.onSelect(index)
    }
}

function makeGradientColorStops(
    colors: ColorRampStep[]
): [offset: number, color: string][] {
    let previousSectionWasTransparent = false
    const colorStops: Array<[offset: number, color: string]> = []
    for (const { color, offset, transparentSection } of colors) {
        const [red, green, blue] = color
        if (previousSectionWasTransparent) {
            colorStops.push([offset, "transparent"])
        } else {
            colorStops.push([
                offset,
                Color.fromRGB(red, green, blue).stringify(),
            ])
        }
        if (transparentSection) {
            colorStops.push([offset, "transparent"])
        } else {
            colorStops.push([
                offset,
                Color.fromRGB(red, green, blue).stringify(),
            ])
        }
        previousSectionWasTransparent = transparentSection
    }
    return colorStops
}
