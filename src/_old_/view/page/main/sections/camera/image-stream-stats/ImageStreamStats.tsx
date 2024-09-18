import * as React from "react"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { useEventTrigger, useEventValue } from "@/_old_/tool/hooks/event"
import { useServiceLocator } from "@/_old_/tool/locator"
import Styles from "./ImageStreamStats.module.css"

export interface ImageStreamStatsProps {
    className?: string
}

export default function (props: ImageStreamStatsProps) {
    const { scene } = useServiceLocator({
        scene: ensureSceneManagerInterface,
    })
    const [width, height] = useEventTrigger(
        scene.imageStream.eventNewImage,
        (imageStream) => {
            const { width, height } = imageStream.image
            return [width, height]
        },
        [0, 0]
    )
    const stats = useEventValue(scene.imageStream.eventStats, {
        bytesPerSecond: 0,
        framesPerSecond: 0,
    })
    return (
        <div className={getClassName(props)}>
            <div>
                <div>{stats.framesPerSecond.toFixed(1)}</div>
                <div>FPS</div>
            </div>
            <div>
                <div>{Math.ceil(stats.bytesPerSecond / 1024)}</div>
                <div>Kb / sec</div>
            </div>
            <div>
                <div>{width}</div>
                <div>×</div>
                <div>{height}</div>
            </div>
        </div>
    )
}

function getClassName({ className }: ImageStreamStatsProps) {
    const classes = [Styles["ImageStreamStats"]]
    if (className) classes.push(className)
    return classes.join(" ")
}
