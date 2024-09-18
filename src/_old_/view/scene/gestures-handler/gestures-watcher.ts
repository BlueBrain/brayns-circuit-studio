import PointerWatcher, { PointerWatcherEvent } from "@/_old_/ui/watcher/pointer"
import { half } from "@/_old_/constants"
import { makeEvent } from "@/_old_/tool/event"

export interface GesturesWatcherEvent {
    x: number
    y: number
    button: number
    altKey: boolean
    ctrlKey: boolean
    shiftKey: boolean
}

/**
 * This class will generate events with a coordinate system
 * usefull with orthographic cameras.
 *
 * * The center of the screen is always `(0, 0)`.
 * * The top/center of the screen is always `(0, 0.5)`.
 * * The bottom/center of the screen is always `(0, -0.5)`.
 */
export default class GesturesWatcher {
    private _canvas: HTMLCanvasElement | null = null
    private _watcher: PointerWatcher | null = null

    public static isRightButtonPressed(evt: GesturesWatcherEvent): boolean {
        if ((evt.button & PointerWatcher.RIGHT_BUTTON) !== 0) return true
        if (evt.altKey) return true
        return false
    }

    public static isMiddleButtonPressed(evt: GesturesWatcherEvent): boolean {
        if ((evt.button & PointerWatcher.MIDDLE_BUTTON) !== 0) return true
        if (evt.ctrlKey) return true
        return false
    }

    public readonly onDown = makeEvent<GesturesWatcherEvent>()
    public readonly onDrag = makeEvent<GesturesWatcherEvent>()
    public readonly onUp = makeEvent<GesturesWatcherEvent>()
    public readonly onZoom = makeEvent<{ delta: number }>()

    get canvas() {
        return this._canvas
    }
    set canvas(canvas: HTMLCanvasElement | null) {
        if (this._canvas === canvas) return

        if (this._canvas && this._watcher) {
            this._watcher.detach()
            this._canvas.removeEventListener("wheel", this.handleWheel)
        }
        this._canvas = canvas

        if (!canvas) return

        this._watcher = new PointerWatcher(
            {
                onDown: this.handleDown,
                onMove: this.handleMove,
                onUp: this.handleUp,
            },
            canvas
        )
        canvas.addEventListener("wheel", this.handleWheel)
    }

    private readonly handleWheel = (evt: WheelEvent) => {
        this.onZoom.trigger({
            delta: evt.deltaY,
        })
    }

    private readonly handleDown = (evt: PointerWatcherEvent) => {
        this.onDown.trigger(this.makeEvent(evt))
    }
    private readonly handleMove = (evt: PointerWatcherEvent) => {
        this.onDrag.trigger(this.makeEvent(evt))
    }
    private readonly handleUp = (evt: PointerWatcherEvent) => {
        this.onUp.trigger(this.makeEvent(evt))
    }

    private makeEvent(evt: PointerWatcherEvent): GesturesWatcherEvent {
        const { canvas } = this
        if (!canvas)
            throw Error("[GesturesWatcher.makeEvent()] Canvas is null!")
        const { width, height } = canvas.getBoundingClientRect()
        const x = (evt.absX - half(width)) / height
        const y = (half(height) - evt.absY) / height
        return { ...evt, x, y }
    }
}
