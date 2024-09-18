import { clamp, half } from "@/_old_/constants"
import ColorRampCanvasPainterInterface from "@/_old_/contract/painter/color-ramp"
import ScalebarCanvasPainterInterface from "@/_old_/contract/painter/scalebar"
import { useServiceLocator } from "@/_old_/tool/locator"
import Icon from "@/_old_/ui/view/icon"
import * as React from "react"
import {
    ColorRampConfig,
    CompositorCanvases,
    RawSnapshot,
    ScalebarConfig,
} from "../types"
import "./preview-view.css"
import { ensureOverlayPainterInterface } from "../../../../contract/manager/overlay-painter"

export interface PreviewViewProps {
    className?: string
    params: RawSnapshot
    colorrampPainter: ColorRampCanvasPainterInterface
    colorrampConfig?: ColorRampConfig
    scalebarPainter: ScalebarCanvasPainterInterface
    scalebarConfig: ScalebarConfig
    onCanvasesCreated(this: void, canvases: CompositorCanvases): void
}

export default function PreviewView(props: PreviewViewProps) {
    const {
        params,
        colorrampPainter,
        colorrampConfig,
        scalebarPainter,
        scalebarConfig,
    } = props
    const [showHint, setShowHint] = React.useState(false)
    React.useEffect(() => setShowHint(true), [props.params])
    const refCanvases = React.useRef<Partial<CompositorCanvases>>({})
    usePaintImage(refCanvases.current.main, params.snapshotFromBrayns)
    usePaintColorramp(
        refCanvases.current.colorramp,
        colorrampPainter,
        colorrampConfig
    )
    usePaintScalebar(
        refCanvases.current.scalebar,
        params,
        scalebarPainter,
        scalebarConfig
    )
    usePaintOverlay(refCanvases.current.overlay, params)
    const mountCanvas = useCanvasMounter(refCanvases, props.onCanvasesCreated)
    return (
        <div className={getClassNames(props)}>
            <div
                className={`scale${showHint ? " show" : ""}`}
                onClick={() => setShowHint(false)}
            >
                <div>use mouse wheel to zoom</div>
                <Icon name="close" />
            </div>
            <div
                ref={onPreviewMounted}
                className="preview"
                style={{
                    width: `${params.width}px`,
                    height: `${params.height}px`,
                    margin: `-${half(params.height)}px -${half(
                        params.width
                    )}px`,
                }}
            >
                <canvas
                    ref={(canvas) => mountCanvas("main", canvas)}
                    className="image"
                    width={params.width}
                    height={params.height}
                ></canvas>
                <canvas
                    ref={(canvas) => mountCanvas("overlay", canvas)}
                    className="image"
                    width={params.width}
                    height={params.height}
                ></canvas>
                <canvas
                    ref={(canvas) => mountCanvas("scalebar", canvas)}
                    className={`scalebar ${
                        props.scalebarConfig.enabled ? "show" : "hide"
                    }`}
                ></canvas>
                <canvas
                    ref={(canvas) => mountCanvas("colorramp", canvas)}
                    className={`colorramp ${
                        props.colorrampConfig?.enabled ? "show" : "hide"
                    }`}
                ></canvas>
            </div>
        </div>
    )
}

function useCanvasMounter(
    refCanvases: React.MutableRefObject<Partial<CompositorCanvases>>,
    onCanvasesCreated: (canvases: CompositorCanvases) => void
) {
    const mountCanvas = React.useCallback(
        (
            name: "main" | "colorramp" | "scalebar" | "overlay",
            canvas: HTMLCanvasElement | null
        ) => {
            if (!canvas) return

            const canvases = refCanvases.current
            if (!canvases) return

            if (canvases[name]) {
                return
            }

            canvases[name] = canvas
            const { main, colorramp, scalebar, overlay } = canvases
            if (main && colorramp && scalebar && overlay) {
                onCanvasesCreated(canvases as CompositorCanvases)
            }
        },
        [refCanvases.current, onCanvasesCreated]
    )
    return mountCanvas
}

function usePaintScalebar(
    scalebarCanvas: HTMLCanvasElement | undefined,
    params: RawSnapshot,
    scalebarManager: ScalebarCanvasPainterInterface,
    scalebarConfig: ScalebarConfig
) {
    React.useEffect(() => {
        if (!scalebarCanvas) return

        const micrometersPerPixel = params.cameraHeight / params.height
        const fontSize = params.width / 100
        scalebarManager.paint(
            scalebarCanvas,
            params.width / 6,
            micrometersPerPixel,
            {
                ...scalebarConfig,
                fontSize,
                gap: half(fontSize),
                lineThickness: fontSize / 6,
                padding: half(fontSize),
                tipsSize: half(fontSize),
            }
        )
    }, [scalebarCanvas, scalebarManager, scalebarConfig])
}

function usePaintColorramp(
    colorrampCanvas: HTMLCanvasElement | undefined,
    colorrampManager: ColorRampCanvasPainterInterface,
    colorrampConfig?: ColorRampConfig
) {
    React.useEffect(() => {
        if (!colorrampConfig || !colorrampCanvas) return

        colorrampManager.paint(colorrampCanvas, colorrampConfig)
    }, [colorrampCanvas, colorrampManager, colorrampConfig])
}

function usePaintImage(
    canvas: HTMLCanvasElement | undefined,
    image: HTMLImageElement
) {
    React.useEffect(() => {
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const w = canvas.width
        const h = canvas.height
        ctx.clearRect(0, 0, w, h)
        ctx.drawImage(image, 0, 0)
    }, [image, canvas])
}

function getClassNames(props: PreviewViewProps): string {
    const classNames = [
        "custom",
        "feature-snapshot-snapshotCompositor-PreviewView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

const ZOOM_IN = 1.1
const ZOOM_OUT = 1 / ZOOM_IN
const MARGIN = 32

function onPreviewMounted(container: HTMLDivElement) {
    // Delay the process to be sure that container has a real size.
    window.requestAnimationFrame(() => {
        const parent = container?.parentElement
        if (!parent) return

        let scale = Math.min(
            (parent.clientWidth - MARGIN) / container.clientWidth,
            (parent.clientHeight - MARGIN) / container.clientHeight
        )
        const minScale = half(scale)
        container.style.transform = `scale(${scale})`
        parent.addEventListener(
            "wheel",
            (evt: WheelEvent) => {
                scale = clamp(
                    scale * (evt.deltaY < 0 ? ZOOM_IN : ZOOM_OUT),
                    minScale,
                    1
                )
                container.style.transform = `scale(${scale})`
            },
            true
        )
    })
}

function usePaintOverlay(
    overlay: HTMLCanvasElement | undefined,
    params: RawSnapshot
) {
    const [ready, setReady] = React.useState(false)
    const { overlayPainter } = useServiceLocator({
        overlayPainter: ensureOverlayPainterInterface,
    })
    React.useEffect(() => {
        if (!overlay) return

        overlayPainter
            .snapshot(params.width, params.height)
            .then((img) => {
                const ctx = overlay.getContext("2d")
                if (!ctx) {
                    throw Error("Not enough memory to create 2D context!")
                }
                const w = params.width
                const h = params.height
                overlay.width = w
                overlay.height = h
                ctx.clearRect(0, 0, w, h)
                ctx.drawImage(img, 0, 0)
                setReady(true)
            })
            .catch(console.error)
    }, [overlay])
    return ready
}
