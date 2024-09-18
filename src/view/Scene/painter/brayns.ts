import { Service } from "@/service/service"

export class PainterBrayns {
    private _image: HTMLImageElement = new Image()
    private _canvas: HTMLCanvasElement | null = null
    private readonly _observer: ResizeObserver
    /**
     * Is there a painting going on?
     * Painting can take time, so if a new call to `paint()`
     * is made before the previous one is done, then we just
     * set `paintIsScheduled = true`.
     */
    private busyPainting = false
    private paintIsScheduled = false

    constructor() {
        this._observer = new ResizeObserver(this.paint)
    }

    get image() {
        return this._image
    }

    get canvas() {
        return this._canvas
    }
    set canvas(canvas: HTMLCanvasElement | null) {
        if (this._canvas) {
            this._observer.unobserve(this._canvas)
        }
        if (canvas) this._observer.observe(canvas)
        this._canvas = canvas
        this.paint()
    }

    readonly paint = () => {
        if (this.busyPainting) {
            this.paintIsScheduled = true
        } else {
            void this.actualPaint()
        }
    }

    private readonly actualPaint = async () => {
        this.busyPainting = true
        try {
            do {
                this.paintIsScheduled = false
                const { canvas } = this
                if (!canvas) continue

                const ctx = canvas.getContext("2d")
                if (!ctx) continue

                const width = canvas.clientWidth
                const height = canvas.clientHeight
                canvas.width = width
                canvas.height = height
                /**
                 * We must prevent the size from going below 64,
                 * otherwise, Brayns will crash!
                 */
                const img = await Service.renderer.snapshot({
                    width: Math.max(64, width),
                    height: Math.max(64, height),
                })
                if (img) {
                    this._image = img
                    ctx.drawImage(img, 0, 0, width, height)
                }
            } while (this.paintIsScheduled)
        } finally {
            this.busyPainting = false
        }
    }
}
