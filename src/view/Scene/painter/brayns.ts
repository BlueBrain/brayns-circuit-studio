import { Service } from "@/service/service"

export class PainterBrayns {
    private _canvas: HTMLCanvasElement | null = null
    private readonly _observer: ResizeObserver

    constructor() {
        this._observer = new ResizeObserver(this.paint)
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
        void this.actualPaint()
    }

    private readonly actualPaint = async () => {
        const { canvas } = this
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const width = canvas.clientWidth
        const height = canvas.clientHeight
        canvas.width = width
        canvas.height = height
        const img = await Service.renderer.snapshot({
            width,
            height,
        })
        if (img) {
            ctx.drawImage(img, 0, 0)
        }
    }
}
