import PointerWatcher, { PointerWatcherEvent } from "@/_old_/ui/watcher/pointer"
import { clamp01 } from "@/_old_/constants"

export interface ColorRampGestureEvent {
    x: number
}

type ColorRampGestureHandler = (evt: ColorRampGestureEvent) => void

const SELECT_TIME_THRESHOLD = 500

export default class ColorRampGesture {
    private _canvas: HTMLCanvasElement | null = null
    private pointerDownTimestamp = 0
    private pointerDownX = 0
    private pointerIsDown = false
    private readonly pointerWatcher: PointerWatcher

    constructor(
        private readonly handleDown: ColorRampGestureHandler,
        private readonly handleMove: ColorRampGestureHandler,
        private readonly handleUp: ColorRampGestureHandler,
        private readonly handleSelect: ColorRampGestureHandler,
        private readonly leftMargin: number,
        private readonly rightMargin: number
    ) {
        this.pointerWatcher = new PointerWatcher({
            onDown: this.handlePointerDown,
            onMove: this.handlePointerMove,
            onUp: this.handlePointerUp,
        })
    }

    get canvas() {
        return this._canvas
    }
    set canvas(value: HTMLCanvasElement | null) {
        this.detach()
        this._canvas = value
        this.attach(value)
    }

    private attach(canvas: HTMLCanvasElement | null) {
        this._canvas = canvas
        this.pointerWatcher.attach(canvas)
    }

    private detach() {
        this.pointerWatcher.detach()
    }

    private readonly handlePointerDown = (evt: PointerWatcherEvent) => {
        this.pointerIsDown = true
        const gestureEvent = this.makeGestureEvent(evt)
        this.pointerDownX = gestureEvent.x
        this.pointerDownTimestamp = evt.timeStamp
        this.handleDown(gestureEvent)
    }

    private readonly handlePointerMove = (evt: PointerWatcherEvent) => {
        if (!this.pointerIsDown) return

        this.handleMove(this.makeGestureEvent(evt))
    }

    private readonly handlePointerUp = (evt: PointerWatcherEvent) => {
        this.pointerIsDown = false
        if (evt.timeStamp - this.pointerDownTimestamp < SELECT_TIME_THRESHOLD) {
            this.handleSelect({ x: this.pointerDownX })
            return
        }
        const gestureEvent = this.makeGestureEvent(evt)
        this.handleUp(gestureEvent)
    }

    private makeGestureEvent(evt: PointerWatcherEvent): ColorRampGestureEvent {
        const { canvas } = this
        if (!canvas) return { x: 0 }

        const { width } = canvas.getBoundingClientRect()
        const x =
            (evt.absX - this.leftMargin) /
            (width - this.leftMargin - this.rightMargin)
        return { x: clamp01(x) }
    }
}
