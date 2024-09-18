import PointerWatcher, { PointerWatcherEvent } from "../../ui/watcher/pointer"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"
import TransfoGestureWatcherInterface, {
    TranslationEvent,
} from "@/_old_/contract/watcher/transfo-gesture"

const HIGH_SPEED = 4
const LOW_SPEED = 0.25

/**
 * For each gesture user can hold Ctrl or Shift key.
 * Ctrl will speed up the gesture, and Shift slow down it.
 *
 * - User orbite with left button.
 * - User translates with right button or left button with Alt key hold.
 * - User zooms with the mouse wheel.
 */
export default class TransfoGestureWatcher
    implements TransfoGestureWatcherInterface
{
    public readonly eventOrbitStart: TriggerableEventInterface<void>
    public readonly eventOrbit: TriggerableEventInterface<TranslationEvent>
    public readonly eventOrbitStop: TriggerableEventInterface<TranslationEvent>

    public readonly eventTranslateStart: TriggerableEventInterface<void>
    public readonly eventTranslate: TriggerableEventInterface<TranslationEvent>
    public readonly eventTranslateStop: TriggerableEventInterface<TranslationEvent>

    public readonly eventZoom: TriggerableEventInterface<number>

    private pointerWatcher = new PointerWatcher({})

    constructor(makeEvent: <T>() => TriggerableEventInterface<T>) {
        this.eventOrbit = makeEvent()
        this.eventOrbitStart = makeEvent()
        this.eventOrbitStop = makeEvent()
        this.eventTranslate = makeEvent()
        this.eventTranslateStart = makeEvent()
        this.eventTranslateStop = makeEvent()
        this.eventZoom = makeEvent()
    }

    public get element() {
        return this._element
    }

    public set element(element: HTMLElement | SVGElement | undefined) {
        if (element === this._element) return

        this.pointerWatcher.detach()
        if (this._element) this.detach()
        this._element = element
        this.attach()
    }

    private _element: HTMLElement | SVGElement | undefined

    private detach() {
        if (!this._element) return

        this._element.removeEventListener("wheel", this.handleWheel)
        this.pointerWatcher.detach()
    }

    private attach() {
        if (!this._element) return

        this._element.addEventListener("wheel", this.handleWheel)
        this.pointerWatcher = new PointerWatcher(
            {
                onDown: this.handlePointerDown,
                onMove: this.handlePointerMove,
            },
            this._element
        )
    }

    private readonly handleWheel = (evt: WheelEvent) => {
        evt.preventDefault()
        const speed = evt.ctrlKey ? HIGH_SPEED : evt.shiftKey ? LOW_SPEED : 1
        this.eventZoom.trigger(evt.deltaY > 0 ? speed : -speed)
    }

    private readonly handlePointerMove = (evt: PointerWatcherEvent) => {
        const scale = applyKeysModifier(evt)
        const x = scale * evt.relX
        const y = scale * evt.relY
        if (isTranslateGesture(evt)) {
            if (evt.ctrlKey) {
                this.eventTranslate.trigger({ x: 0, y: 0, z: y })
            } else {
                this.eventTranslate.trigger({ x, y, z: 0 })
            }
            return
        }
        this.eventOrbit.trigger({ x, y, z: 0 })
    }

    private readonly handlePointerDown = (evt: PointerWatcherEvent) => {
        if (isTranslateGesture(evt)) {
            this.eventTranslateStart.trigger()
            return
        }
        this.eventOrbitStart.trigger()
    }
}

/**
 * Zooming can be faster is Control is held
 * and slower if Shift is held.
 */
function applyKeysModifier({
    shiftKey,
    ctrlKey,
}: {
    shiftKey: boolean
    ctrlKey: boolean
}) {
    if (ctrlKey) return HIGH_SPEED
    if (shiftKey) return LOW_SPEED
    return 1
}

function isTranslateGesture(evt: PointerWatcherEvent) {
    if (evt.button === PointerWatcher.RIGHT_BUTTON) return true
    if (evt.button === PointerWatcher.LEFT_BUTTON && evt.altKey) return true
    return false
}
