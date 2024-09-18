import {
    TgdContext,
    TgdGeometry,
    TgdMaterialGhost,
    TgdPainter,
    TgdPainterClear,
    TgdPainterGroup,
    TgdPainterMesh,
    TgdPainterState,
    webglPresetBlend,
    webglPresetDepth,
} from "@tolokoban/tgd"

/**
 * Render a totaly opaque black and white mesh
 * with ghost material.
 * This is like a stamp, because we will need to "apply" it
 * on the final renderbuffer to get transparency and color.
 */
export class StampPainter extends TgdPainter {
    private readonly painter: TgdPainter

    constructor(
        private readonly context: TgdContext,
        geometry: TgdGeometry
    ) {
        super()
        const material = new TgdMaterialGhost()
        this.painter = new TgdPainterGroup([
            new TgdPainterClear(context, {
                color: [0, 0, 0, 1],
            }),
            new TgdPainterState(context, {
                depth: webglPresetDepth.less,
                blend: webglPresetBlend.off,
                children: [
                    new TgdPainterClear(context, {
                        depth: 1,
                    }),
                    new TgdPainterMesh(context, { geometry, material }),
                ],
            }),
        ])
    }

    public readonly paint = (time: number, delay: number) => {
        this.painter.paint(time, delay)
    }

    delete(): void {
        this.painter.delete()
    }
}
