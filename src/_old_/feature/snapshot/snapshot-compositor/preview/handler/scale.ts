import { clamp, double } from "@/_old_/constants"
import { useResizeObserver } from "@/_old_/ui/hooks/resize-observer"
import * as React from "react"

const MARGIN = 16
const MIN_WIDTH = 64
const MIN_HEIGHT = 48
const RESIZE_DEBOUNCING_DELAY = 300

export function useCanvasScale(
    refCanvas: React.MutableRefObject<null | HTMLCanvasElement>
): [number, number, number] {
    const [canvas, setCanvas] = React.useState(refCanvas.current)
    React.useEffect(() => setCanvas(refCanvas.current), [refCanvas])
    const container = canvas ? canvas.parentElement : null
    const [size, setSize] = React.useState([0, 0])
    const [width, height] = size
    useResizeObserver(
        ({ width, height }) => setSize([width, height]),
        RESIZE_DEBOUNCING_DELAY
    )(refCanvas.current)
    const [zoom, setZoom] = React.useState(1)
    const scaleForFit = React.useMemo(
        () => computeFitScale(canvas, width, height),
        [canvas, width, height]
    )
    // Whe container is resized, reset the mouse wheel zoom factor.
    React.useEffect(() => setZoom(1), [width, height])
    React.useEffect(() => {
        if (!container) return undefined

        const handleMouseWheel = (evt: WheelEvent) => {
            const ZOOM_STEP = 0.05
            const newZoom =
                zoom + (evt.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP) / scaleForFit
            setZoom(clamp(newZoom, ZOOM_STEP, 1 / scaleForFit))
        }
        container.addEventListener("wheel", handleMouseWheel, true)
        return () =>
            container.removeEventListener("wheel", handleMouseWheel, true)
    }, [zoom, scaleForFit, container])
    if (!canvas) return [MIN_WIDTH, MIN_HEIGHT, 1]

    const scale = scaleForFit * zoom
    return [
        Math.max(MIN_WIDTH, canvas.width * scale),
        Math.max(MIN_HEIGHT, canvas.height * scale),
        scale,
    ]
}

/**
 * Compute the scale that fits the canvas in a container with a margin of MARGIN.
 * The scale can never be greater than 1. The canvas is only shrank if it does
 * not fit in the container, otherwise it is kept as is.
 */
function computeFitScale(
    canvas: null | HTMLCanvasElement,
    width: number,
    height: number
) {
    if (!canvas) return 1

    const SPACE = double(MARGIN)
    if (width < SPACE || height < SPACE) return 1

    const scaleWidth = (width - double(MARGIN)) / canvas.width
    const scaleHeight = (height - double(MARGIN)) / canvas.height
    const scale = Math.min(Math.min(scaleWidth, scaleHeight), 1)
    return Math.min(1, scale)
}
