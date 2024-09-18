import * as React from "react"

/**
 * Here is an eample of how to use this Resize Observer hook:
 * ```
 * function View() {
 *   const handleCanvasMount = useResizeObserver<HTMLCanvasElement>(
 *     ({element, width, height}) => {
 *       element.width = width
 *       element.height = height
 *     }
 *   )
 *   return <canvas ref={handleCanvasMount}></canvas>
 * }
 * ```
 * @param debounceDelay If defined, debounce the dimension update.
 */
export function useResizeObserver<T extends Element>(
    onResize: (arg: { element: T; width: number; height: number }) => void,
    debounceDelay = 300
): (element: T | null) => void {
    const refElement = React.useRef<T | null>(null)
    const refTimeoutId = React.useRef(0)
    const handleResize = () => {
        const element = refElement.current
        if (!element) return

        window.clearTimeout(refTimeoutId.current)
        refTimeoutId.current = window.setTimeout(() => {
            const { width, height } = element.getBoundingClientRect()
            onResize({ element, width, height })
        }, debounceDelay)
    }
    const refObserver = React.useRef(new ResizeObserver(handleResize))
    React.useEffect(() => {
        // Stop observing on unmount.
        return () => {
            if (refElement.current) {
                refObserver.current.unobserve(refElement.current)
            }
        }
    }, [])
    return (element: T | null) => {
        if (refElement.current) {
            refObserver.current.unobserve(refElement.current)
        }
        refElement.current = element
        if (element) refObserver.current.observe(element)
        handleResize()
    }
}
