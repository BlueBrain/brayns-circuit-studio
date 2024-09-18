import * as React from "react"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import ScalebarCanvasPainterInterface from "@/_old_/contract/painter/scalebar"
import { debounce } from "@/_old_/tool/async"
import { double } from "@/_old_/constants"

const PAINTER_DEBOUNCING_DELAY = 300
const PREFERRED_SCALEBAR_SIZE = 180

export function useScalebar(
    refContainer: React.MutableRefObject<HTMLDivElement | null>,
    camera: CameraModuleInterface,
    scalebarPainter: ScalebarCanvasPainterInterface
) {
    const refScalebar = React.useRef<HTMLCanvasElement | null>(null)
    React.useEffect(() => {
        const asyncPaint = debounce(() => {
            const container = refContainer.current
            const canvas = refScalebar.current
            if (!canvas || !container) return

            const { params } = camera
            if (params.type !== "orthographic") return

            const micrometersPerPixel =
                double(params.height) / container.clientHeight
            scalebarPainter.paint(
                canvas,
                PREFERRED_SCALEBAR_SIZE,
                micrometersPerPixel
            )
        }, PAINTER_DEBOUNCING_DELAY)
        const paint = () => {
            void asyncPaint()
        }
        void paint()
        camera.eventChange.add(paint)
        return () => camera.eventChange.remove(paint)
    }, [camera])
    return refScalebar
}
