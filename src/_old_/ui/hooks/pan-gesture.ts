import * as React from "react"
import { isObject } from "@/_old_/tool/validator"

export interface PositionEvent {
    /** Absolute coordinate X in pixels */
    absX: number
    /** Absolute coordinate Y in pixels */
    absY: number
    /** Relative coordinate X (between 0 and 1) */
    relX: number
    /** Relative coordinate Y (between 0 and 1) */
    relY: number
    timeStamp: number
}

export interface PanEvent extends PositionEvent {
    /** Absolute displacement along X axis from Start event */
    absDeltaX: number
    /** Absolute displacement along Y axis from Start event */
    absDeltaY: number
    /** Absolute displacement along Z axis from Start event */
    absDeltaZ: number
    /** Relative displacement along X axis from Start event (between 0 and 1) */
    relDeltaX: number
    /** Relative displacement along Y axis from Start event (between 0 and 1) */
    relDeltaY: number
    /** Relative displacement along Z axis from Start event (between 0 and 1) */
    relDeltaZ: number
}

export interface SwipeEvent extends PanEvent {
    /** Average speed along X axis in pixels per millisecond */
    speedX: number
    /** Average speed along Y axis in pixels per millisecond */
    speedY: number
}

export interface PanGestureHandlers {
    /** Triggered as soon as the pointer is down */
    onStart?(this: void, event: PositionEvent): void
    /** Triggered during dragging */
    onPan?(this: void, evt: PanEvent): void
    /** Triggered when the dragging is over and the speed is enough */
    onSwipe?(this: void, evt: SwipeEvent): void
    /** Triggered as soon as the pointer is up or the pan has been cancelled */
    onEnd?(this: void, event: PositionEvent): void
}

interface ElementState {
    /**
     * When the element has been touched for the first time.
     */
    start: PositionEvent
    savedTouchAction: string
    isDragging: boolean
}

class Gestures {
    private static nextId = 1

    private readonly id = Gestures.nextId++

    private static readonly elements: Map<Element, ElementState> = new Map()

    constructor(
        private readonly element: Element,
        private readonly handlers: PanGestureHandlers
    ) {
        element.addEventListener("pointerdown", this.handlePointerDown, false)
        element.addEventListener("pointermove", this.handlePointerMove, false)
        element.addEventListener("pointerup", this.handlePointerUp, false)
        element.addEventListener("pointercancel", this.handlePointerCancel)
        element.addEventListener("contextmenu", this.handleContextMenu)
    }

    public detach() {
        const { element } = this
        element.removeEventListener(
            "pointerdown",
            this.handlePointerDown,
            false
        )
        element.removeEventListener(
            "pointermove",
            this.handlePointerMove,
            false
        )
        element.removeEventListener("pointerup", this.handlePointerUp, false)
        element.removeEventListener("pointercancel", this.handlePointerCancel)
        element.removeEventListener("contextmenu", this.handleContextMenu)
    }

    private get state(): ElementState {
        const { element } = this
        if (!Gestures.elements.has(element)) {
            Gestures.elements.set(element, {
                isDragging: false,
                savedTouchAction: "",
                start: {
                    absX: 0,
                    absY: 0,
                    relX: 0,
                    relY: 0,
                    timeStamp: 0,
                },
            })
        }
        return Gestures.elements.get(element) as ElementState
    }

    // eslint-disable-next-line class-methods-use-this
    private readonly handleContextMenu = (evt: Event) => {
        evt.preventDefault()
        evt.stopPropagation()
    }

    private readonly handlePointerCancel = (evt: PointerEvent) => {
        this.handlePointerUp(evt)
    }

    private readonly handlePointerDown = (evt: PointerEvent) => {
        const start = this.getCoords(evt)
        this.state.start = start
        this.state.isDragging = true
        this.element.setPointerCapture(evt.pointerId)
        if (hasStyle(this.element)) {
            this.state.savedTouchAction = this.element.style.touchAction
            this.element.style.touchAction = "none"
        }
        this.onStart({ ...start })
    }

    private readonly handlePointerMove = (evt: PointerEvent) => {
        if (!this.state.isDragging) return

        const coords = this.getCoords(evt)
        const event: PanEvent = {
            ...coords,
            absDeltaX: coords.absX - this.state.start.absX,
            absDeltaY: coords.absY - this.state.start.absY,
            absDeltaZ: 0,
            relDeltaX: coords.relX - this.state.start.relX,
            relDeltaY: coords.relY - this.state.start.relY,
            relDeltaZ: 0,
        }
        if (evt.altKey) {
            // Moving forward/backward (along Z).
            event.absDeltaZ = event.absDeltaY
            event.relDeltaZ = event.relDeltaY
            event.absDeltaX = 0
            event.absDeltaY = 0
            event.relDeltaX = 0
            event.relDeltaY = 0
        }
        this.onPan(event)
    }

    private readonly handlePointerUp = (evt: PointerEvent) => {
        if (hasStyle(this.element)) {
            this.element.style.touchAction = this.state.savedTouchAction
        }
        const { state, onSwipe, onEnd } = this
        const coords = this.getCoords(evt)
        const absDeltaX = coords.absX - state.start.absX
        const absDeltaY = coords.absY - state.start.absY
        const relDeltaX = coords.relX - state.start.relX
        const relDeltaY = coords.relY - state.start.relY
        const deltaTime = evt.timeStamp - state.start.timeStamp
        const event: SwipeEvent = {
            ...coords,
            absDeltaX,
            absDeltaY,
            absDeltaZ: 0,
            relDeltaX,
            relDeltaY,
            relDeltaZ: 0,
            speedX: absDeltaX / deltaTime,
            speedY: absDeltaY / deltaTime,
        }
        if (evt.altKey) {
            // Moving forward/backward (along Z).
            event.absDeltaZ = event.absDeltaY
            event.relDeltaZ = event.relDeltaY
            event.absDeltaX = 0
            event.absDeltaY = 0
            event.relDeltaX = 0
            event.relDeltaY = 0
        }
        onSwipe(event)
        onEnd({ ...coords })
        state.isDragging = false
    }

    private getCoords(evt: PointerEvent): {
        absX: number
        absY: number
        relX: number
        relY: number
        timeStamp: number
    } {
        const { element } = this
        const rect = element.getBoundingClientRect()
        const absX = evt.clientX - rect.left
        const relX = absX / rect.width
        const absY = evt.clientY - rect.top
        const relY = absY / rect.height
        const timeStamp = evt.timeStamp
        return { absX, absY, relX, relY, timeStamp }
    }

    private readonly onStart = (evt: PositionEvent) => {
        const { onStart } = this.handlers
        if (onStart) onStart(evt)
    }

    private readonly onPan = (evt: PanEvent) => {
        const { onPan } = this.handlers
        if (onPan) onPan(evt)
    }

    private readonly onSwipe = (evt: SwipeEvent) => {
        const { onSwipe } = this.handlers
        if (onSwipe) onSwipe(evt)
    }

    private readonly onEnd = (evt: PositionEvent) => {
        const { onEnd } = this.handlers
        if (onEnd) onEnd(evt)
    }
}

export function usePanGesture<T extends Element>(handlers: PanGestureHandlers) {
    const ref = React.useRef<null | T>(null)
    React.useEffect(() => {
        if (!ref.current) return

        const gestures = new Gestures(ref.current, handlers)
        // eslint-disable-next-line consistent-return
        return () => gestures.detach()
    }, [ref, handlers])
    return ref
}

interface StyledElement {
    style: { [key: string]: string }
}

function hasStyle(element: unknown): element is StyledElement {
    if (!isObject(element)) return false
    return typeof element.style !== "undefined"
}
