import * as React from "react"
import GenericEvent from "@/_old_/tool/event"

export interface HitTestCoords {
    x: number
    y: number
}

export function useCanvasClick(): [
    handleCanvasClick: (
        x: number,
        y: number,
        width: number,
        height: number
    ) => void,
    event: GenericEvent<HitTestCoords>,
] {
    const refEvent = React.useRef(new GenericEvent<HitTestCoords>())
    const handleCanvasClick = React.useCallback(
        (x: number, y: number, width: number, height: number) => {
            const hitX = x / width
            const hitY = 1 - y / height
            refEvent.current.trigger({ x: hitX, y: hitY })
        },
        [refEvent.current]
    )
    return [handleCanvasClick, refEvent.current]
}
