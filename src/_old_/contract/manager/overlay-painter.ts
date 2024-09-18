import CameraModuleInterface from "./camera"

export function ensureOverlayPainterInterface(
    data: unknown
): OverlayPainterInterface {
    if (data instanceof OverlayPainterInterface) return data

    console.error("Expected OverlayPainterInterface but got:", data)
    throw Error("Service is not of type OverlayPainterInterface!")
}

export default abstract class OverlayPainterInterface {
    abstract snapshot(
        width: number,
        height: number,
        braynsCamera?: CameraModuleInterface
    ): Promise<HTMLImageElement>
    abstract attach(canvas: HTMLCanvasElement)
    abstract detach()
}
