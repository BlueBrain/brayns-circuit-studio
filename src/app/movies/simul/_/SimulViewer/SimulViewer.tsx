import { TgdCamera } from "@tolokoban/tgd"
import { ViewPanel, ViewSpinner } from "@tolokoban/ui"

import { classNames } from "@/util/utils"
import { Bullet } from "../Bullet"
import { ActiveValue } from "../active-value"
import { useMountCanvasHandler, useSimulData } from "./hooks"

import styles from "./simul-viewer.module.css"

export interface SimulViewerProps {
    className?: string
    index: number
    step: ActiveValue<number>
    concentration: number
    seed: number
    camera: TgdCamera
}

export function SimulViewer({
    className,
    index,
    step,
    concentration,
    seed,
    camera,
}: SimulViewerProps) {
    const simulData = useSimulData(index)
    const handleMountCanvas = useMountCanvasHandler(step, index)
    return (
        <div className={classNames(styles.main, className)}>
            {simulData ? (
                <canvas
                    ref={(canvas: HTMLCanvasElement | null) => {
                        handleMountCanvas(canvas, simulData, camera)
                    }}
                ></canvas>
            ) : (
                <ViewPanel display="grid" placeItems="center" fullsize>
                    <ViewSpinner>Loading simulation data...</ViewSpinner>
                </ViewPanel>
            )}
            <footer>
                <Bullet color="#f00">
                    calciumConcentration <b>{concentration}</b>
                </Bullet>
                <Bullet color="#0ff">
                    seed <b>{seed}</b>
                </Bullet>
            </footer>
        </div>
    )
}
