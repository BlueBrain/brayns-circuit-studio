import * as React from "react"

const EMPTY_CANVAS: HTMLCanvasElement = document.createElement("canvas")

/**
 * This hook gives you access to a Canvas and will
 * adapt its geomety to its actual size.
 *
 * ```
 * const [canvas, setCanvas] = useCanvasResizer()
 * return <canvas ref={setCanvas}></canvas>
 * ```
 *
 * @param onResize A function to call every time the canvas has been resized.
 */
export function useCanvasResizer(
    onResize?: (this: void, width: number, height: number) => void
): [canvas: HTMLCanvasElement, setCanvas: (canvas: HTMLCanvasElement) => void] {
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement>(EMPTY_CANVAS)
    React.useEffect(() => {
        if (!canvas) return

        const resizeCanvas = () => {
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
            if (onResize) onResize(canvas.width, canvas.height)
        }
        const observer = new ResizeObserver(resizeCanvas)
        observer.observe(canvas)
        window.requestAnimationFrame(resizeCanvas)
        return () => observer.unobserve(canvas)
    }, [canvas, onResize])
    return [canvas, setCanvas]
}
