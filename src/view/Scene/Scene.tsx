import React from "react"
import { classNames } from "@/util/utils"

import styles from "./scene.module.css"
import { PainterBrayns } from "./painter/brayns"

export interface SceneProps {
    className?: string
}

export function Scene({ className }: SceneProps) {
    const refPainterBrayns = React.useRef<PainterBrayns | null>(null)
    return (
        <div className={classNames(styles.main, className)}>
            <canvas
                ref={(canvas) => {
                    if (!canvas) return

                    if (!refPainterBrayns.current) {
                        refPainterBrayns.current = new PainterBrayns()
                    }
                    refPainterBrayns.current.canvas = canvas
                }}
            ></canvas>
        </div>
    )
}
