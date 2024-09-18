import React from "react"
import { classNames } from "@/util/utils"

import styles from "./scene.module.css"
import { PainterBrayns } from "./painter/brayns"

export interface SceneProps {
    className?: string
}

export function Scene({ className }: SceneProps) {
    const refPainterBrayns = React.useRef<PainterBrayns | null>(null)
    const handleMount = React.useCallback(
        (canvas: HTMLCanvasElement | null) => {
            if (!canvas) return

            if (!refPainterBrayns.current) {
                refPainterBrayns.current = new PainterBrayns()
            }
            refPainterBrayns.current.canvas = canvas
        },
        [refPainterBrayns]
    )
    return (
        <div className={classNames(styles.main, className)}>
            <canvas ref={handleMount}></canvas>
        </div>
    )
}
