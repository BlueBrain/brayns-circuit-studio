import * as React from "react"
import "./scene-canvas-view.css"
import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import ImageStreamView from "@/_old_/view/image-stream/image-stream-view"

export interface SceneCanvasViewProps {
    className?: string
    onCanvasReady(this: void, canvas: HTMLCanvasElement): void
    onSizeChange(this: void, size: { width: number; height: number }): void
    onDoubleClick(this: void, x: number, y: number): void
    imageStream: ImageStreamInterface
}

/**
 * Responsibility:
 *  - Display a canvas
 *  - Keep canvas pixel size in sync with canvas DOM size.
 *  - Trigger when ready and when size has changed
 */
export default function SceneCanvasView(props: SceneCanvasViewProps) {
    return (
        <ImageStreamView
            imageStream={props.imageStream}
            viewportAutoReset={true}
            onCanvasReady={props.onCanvasReady}
            onResize={(width, height) => props.onSizeChange({ width, height })}
            onDoubleClick={(x, y, width, height) =>
                props.onDoubleClick(x / width, y / height)
            }
            className={getClassNames(props)}
        />
    )
}

function getClassNames(props: SceneCanvasViewProps): string {
    const classNames = ["custom", "factory-sceneViewFactory-SceneCanvasView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
