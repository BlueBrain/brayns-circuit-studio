import { ensureOverlayPainterInterface } from "@/_old_/contract/manager/overlay-painter"
import { debounce } from "@/_old_/tool/async"
import { useServiceLocator } from "@/_old_/tool/locator"
import * as React from "react"
import { SnapshotParams } from ".."

const PREVIEW_DEBOUNCING_DELAY = 300

/**
 * Preview management. If dimension and/or transparency has changed,
 * the preview is refreshed.
 * @param fastSnapshot Function to use to actually get a snapshot
 */
export function useSnapshotPreview(
    params: SnapshotParams,
    fastSnapshot: (
        snapshotParams: SnapshotParams
    ) => Promise<HTMLImageElement | null>
): [preview: null | JSX.Element, loadingPreview: boolean] {
    const { overlayPainter } = useServiceLocator({
        overlayPainter: ensureOverlayPainterInterface,
    })
    const refLastPreviewSize = React.useRef("")
    const [loadingPreview, setLoadingPreview] = React.useState(true)
    const [preview, setPreview] = React.useState<null | JSX.Element>(null)
    const updatePreview = React.useMemo(
        () =>
            debounce(async (newParams: SnapshotParams) => {
                const previewSignature = `${newParams.width}x${
                    newParams.height
                }/${newParams.transparentBackground ? "Transparent" : "Opaque"}`
                // If the new preview has same dimensions as the previous one,
                // we don't make a new one.
                if (previewSignature === refLastPreviewSize.current) return

                refLastPreviewSize.current = previewSignature
                setLoadingPreview(true)
                try {
                    const { width, height } = makeItFit(newParams, 240)
                    const overlayImage = await overlayPainter.snapshot(
                        width,
                        height
                    )
                    setPreview(
                        <img
                            src={overlayImage.src}
                            alt="Snapshot preview"
                            width={width}
                            height={height}
                        />
                    )
                    const img = await fastSnapshot(newParams)
                    if (!img) setPreview(null)
                    else {
                        const canvas = document.createElement("canvas")
                        canvas.width = width
                        canvas.height = height
                        const ctx = canvas.getContext("2d")
                        if (!ctx) throw Error("Unable to create 2D context!")

                        ctx.drawImage(img, 0, 0)
                        ctx.drawImage(overlayImage, 0, 0)
                        setPreview(
                            <img
                                src={canvas.toDataURL()}
                                alt="Snapshot preview"
                                width={img.width}
                                height={img.height}
                            />
                        )
                    }
                } catch (ex) {
                    console.error("Unable to get snapshot for preview:", ex)
                } finally {
                    setLoadingPreview(false)
                }
            }, PREVIEW_DEBOUNCING_DELAY),
        [fastSnapshot]
    )
    void updatePreview(params)

    return [preview, loadingPreview]
}

function makeItFit(
    dimensions: { width: number; height: number },
    maxSize: number
): { width: number; height: number } {
    const scale = maxSize / Math.max(dimensions.width, dimensions.height)
    return {
        width: Math.round(scale * dimensions.width),
        height: Math.round(scale * dimensions.height),
    }
}
