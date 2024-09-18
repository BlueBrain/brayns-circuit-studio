export interface PointerWatcherEvent {
    absX: number
    absY: number
    /** Relative x from where the pointer touched. */
    relX: number
    /** Relative y from where the pointer touched. */
    relY: number
    button: number
    altKey: boolean
    ctrlKey: boolean
    shiftKey: boolean
    timeStamp: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const EMPTY_EVENT_HANDLER = (_evt: PointerWatcherEvent) => {}

class PointerWatcher {
    public static LEFT_BUTTON = 0
    public static MIDDLE_BUTTON = 1
    public static RIGHT_BUTTON = 2
    public static BACK_BUTTON = 3
    public static FORWARD_BUTTON = 4

    private altKey = false
    private ctrlKey = false
    private shiftKey = false
    private button = 0
    private element: Element | null = null
    private readonly onDown: (evt: PointerWatcherEvent) => void
    private readonly onMove: (evt: PointerWatcherEvent) => void
    private readonly onUp: (evt: PointerWatcherEvent) => void

    private static activeWatchers: PointerWatcher[] = []
    private static initialized = false
    private static originX = 0
    private static originY = 0

    constructor(
        handlers: Partial<{
            onDown: (evt: PointerWatcherEvent) => void
            onMove: (evt: PointerWatcherEvent) => void
            onUp: (evt: PointerWatcherEvent) => void
        }>,
        element: Element | null = null
    ) {
        PointerWatcher.initializeIfNotAlreadyDone()
        this.onDown = handlers.onDown ?? EMPTY_EVENT_HANDLER
        this.onMove = handlers.onMove ?? EMPTY_EVENT_HANDLER
        this.onUp = handlers.onUp ?? EMPTY_EVENT_HANDLER
        this.attach(element)
    }

    private static initializeIfNotAlreadyDone() {
        if (PointerWatcher.initialized) return

        window.document.addEventListener(
            "pointerdown",
            (evt: PointerEvent) => {
                PointerWatcher.originX = evt.clientX
                PointerWatcher.originY = evt.clientY
            },
            true
        )
        window.document.addEventListener(
            "pointermove",
            (evt: PointerEvent) => {
                for (const target of PointerWatcher.activeWatchers) {
                    target.handlePointerMove(evt)
                }
            },
            true
        )
        window.document.addEventListener(
            "pointerup",
            (evt: PointerEvent) => {
                for (const target of PointerWatcher.activeWatchers) {
                    target.handlePointerUp(evt)
                }
                PointerWatcher.activeWatchers = []
            },
            true
        )
        PointerWatcher.initialized = true
    }

    attach(element: Element | null) {
        this.detach()

        this.element = element
        if (!element) return

        element.addEventListener("pointerdown", this.handlePointerDown)
        element.addEventListener("contextmenu", this.handleContextMenu)
    }

    detach() {
        const { element } = this
        if (!element) return

        element.removeEventListener("pointerdown", this.handlePointerDown)
        element.removeEventListener("contextmenu", this.handleContextMenu)
    }

    private readonly handleContextMenu = (evt: Event) => {
        evt.preventDefault()
    }

    private readonly handlePointerDown = (evt: PointerEvent) => {
        const { element } = this
        if (!element) return

        PointerWatcher.activeWatchers.push(this)
        this.altKey = evt.altKey
        this.ctrlKey = evt.ctrlKey
        this.shiftKey = evt.shiftKey
        this.button = evt.button
        const { left, top } = this.getElementCorner()
        this.onDown({
            absX: evt.clientX - left,
            absY: evt.clientY - top,
            relX: 0,
            relY: 0,
            altKey: evt.altKey,
            ctrlKey: evt.ctrlKey,
            shiftKey: evt.shiftKey,
            button: evt.button,
            timeStamp: evt.timeStamp,
        })
    }

    private readonly handlePointerMove = (evt: PointerEvent) => {
        this.onMove(this.makeWatcherEvent(evt))
    }

    private readonly handlePointerUp = (evt: PointerEvent) => {
        this.onUp(this.makeWatcherEvent(evt))
    }

    private getElementCorner() {
        const { element } = this
        if (!element) return { left: 0, top: 0 }

        return element.getBoundingClientRect()
    }

    private makeWatcherEvent(evt: PointerEvent): PointerWatcherEvent {
        const { left, top } = this.getElementCorner()
        const x = evt.clientX - left
        const y = evt.clientY - top
        return {
            absX: x,
            absY: y,
            relX: evt.clientX - PointerWatcher.originX,
            relY: evt.clientY - PointerWatcher.originY,
            altKey: this.altKey,
            ctrlKey: this.ctrlKey,
            shiftKey: this.shiftKey,
            button: this.button,
            timeStamp: evt.timeStamp,
        }
    }
}

export default PointerWatcher
