import EventInterface from "../tool/event"

export interface TranslationEvent {
    /**
     * Relative to first touching X.
     */
    x: number
    /**
     * Relative to first touching Y.
     */
    y: number
    /**
     * Simulate a translation along the Z axis.
     */
    z: number
}

export default interface TransfoGestureWatcherInterface {
    readonly eventOrbitStart: EventInterface<void>
    readonly eventOrbit: EventInterface<TranslationEvent>
    readonly eventOrbitStop: EventInterface<TranslationEvent>
    readonly eventTranslateStart: EventInterface<void>
    readonly eventTranslate: EventInterface<TranslationEvent>
    readonly eventTranslateStop: EventInterface<TranslationEvent>
    readonly eventZoom: EventInterface<number>

    /**
     * The watched element.
     * This watcher works on only one element at the time,
     * if you reassign `element` the previous one will not
     * be watched anymore.
     */
    element: HTMLElement | SVGElement | undefined
}
