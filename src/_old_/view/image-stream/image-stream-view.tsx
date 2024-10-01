import * as React from "react"

import OverlayPainter from "../../manager/overlay-painter/overlay-painter"

import { half } from "@/_old_/constants"
import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import { useCanvasResizer } from "@/_old_/ui/hooks/canvas-resizer"

import "./image-stream-view.css"

export interface ImageStreamViewProps {
    className?: string
    imageStream: ImageStreamInterface
    /** If true, the viewport is reset everytime the canvas' size changes. */
    viewportAutoReset: boolean
    onCanvasReady?(this: void, canvas: HTMLCanvasElement): void
    /**
     * The user cliked on the screen. The coordinates are relative to the
     * top left corner of the canvas.
     */
    onClick?(
        this: void,
        x: number,
        y: number,
        width: number,
        height: number
    ): void
    onDoubleClick?(
        this: void,
        x: number,
        y: number,
        width: number,
        height: number
    ): void
    onResize?(this: void, width: number, height: number): void
}

/**
 * Display the images sent by Brayns on a canvas.
 */
export default function ImageStreamView(props: ImageStreamViewProps) {
    const refOverlay = OverlayPainter.useOverlayCanvasRef()
    const [braynsCanvas, setBraynsCanvas] = useCanvasResizer(
        (width: number, height: number) => {
            const { onResize, viewportAutoReset, imageStream } = props
            if (onResize) onResize(width, height)
            if (viewportAutoReset) {
                void imageStream.setViewport(width, height)
            }
        }
    )
    React.useEffect(() => {
        const { onCanvasReady } = props
        if (onCanvasReady) onCanvasReady(braynsCanvas)
    }, [braynsCanvas, props.onCanvasReady])
    useImageStream(props, braynsCanvas)
    useClickHandler(props, braynsCanvas)
    useDoubleClickHandler(props, braynsCanvas)
    return (
        <div className={getClassNames(props)}>
            <canvas ref={setBraynsCanvas}></canvas>
            <canvas
                ref={refOverlay}
                style={{
                    pointerEvents: "none",
                    background: "transparent",
                }}
            ></canvas>
        </div>
    )
}

function useClickHandler(
    props: ImageStreamViewProps,
    canvas: HTMLCanvasElement
) {
    React.useEffect(() => {
        const { onClick } = props
        if (!onClick) return

        const clickHandler = (evt: MouseEvent) => {
            const { left, top, width, height } = canvas.getBoundingClientRect()
            const x = evt.clientX - left
            const y = evt.clientY - top
            void props.imageStream.askForNextFrame()
            onClick(x, y, width, height)
        }
        canvas.addEventListener("click", clickHandler)
        return () => canvas.removeEventListener("click", clickHandler)
    }, [canvas, props.onClick])
}

function useDoubleClickHandler(
    props: ImageStreamViewProps,
    canvas: HTMLCanvasElement
) {
    React.useEffect(() => {
        const { onDoubleClick } = props
        if (!onDoubleClick) return

        const clickHandler = (evt: MouseEvent) => {
            const { left, top, width, height } = canvas.getBoundingClientRect()
            const x = evt.clientX - left
            const y = evt.clientY - top
            onDoubleClick(x, y, width, height)
        }
        canvas.addEventListener("dblclick", clickHandler)
        return () => canvas.removeEventListener("dblclick", clickHandler)
    }, [canvas, props.onDoubleClick])
}

/**
 * Every time a new image is sent by Brayns,
 * it is rescaled to fit the current canvas.
 */
function useImageStream(
    props: ImageStreamViewProps,
    canvas: HTMLCanvasElement
) {
    React.useEffect(() => {
        const handleNewImage = () => {
            const ctx = canvas.getContext("2d")
            if (!ctx) {
                console.error("Unable to get context 2D!")
                return
            }

            const img = props.imageStream.image
            const scaleWidth = canvas.width / img.width
            const scaleHeight = canvas.height / img.height
            const scale = Math.min(scaleWidth, scaleHeight)
            const scaledWidth = Math.floor(img.width * scale)
            const scaledHeight = Math.floor(img.height * scale)
            const x = Math.floor(half(canvas.width - scaledWidth))
            const y = Math.floor(half(canvas.height - scaledHeight))
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        }
        props.imageStream.eventNewImage.add(handleNewImage)
        window.requestAnimationFrame(handleNewImage)
        return () => props.imageStream.eventNewImage.remove(handleNewImage)
    }, [canvas, props.imageStream])
}

function getClassNames(props: ImageStreamViewProps): string {
    const classNames = ["custom", "view-ImageStreamView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
