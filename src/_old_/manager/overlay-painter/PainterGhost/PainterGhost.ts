import {
    TgdContext,
    TgdGeometry,
    TgdGeometryBox,
    TgdPainter,
    TgdPainterFramebufferOld,
    TgdParserGLTransfertFormatBinary,
    TgdParserMeshWavefront,
    TgdVec4,
    webglBlendExec,
    webglPresetBlend,
} from "@tolokoban/tgd"

import { LayerPainter } from "./layer/layer-painter"
import { StampPainter } from "./stamp/stamp-painter"

export interface PainterGhostOptions {
    /**
     * A `string` for Wavefront objects, and an `ArrayBuffer` for GLB objects.
     */
    geometry: TgdGeometry
    color?: TgdVec4
}

export class PainterGhost extends TgdPainter {
    public readonly color = new TgdVec4(1, 1, 1, 1)

    private readonly stamp: StampPainter
    private readonly framebuffer: TgdPainterFramebufferOld
    private readonly layer: LayerPainter

    constructor(
        private readonly context: TgdContext,
        { geometry, color }: PainterGhostOptions
    ) {
        super()
        if (color) {
            this.color.reset(...color)
        }
        this.stamp = new StampPainter(context, geometry)
        this.framebuffer = new TgdPainterFramebufferOld(context, {
            viewportMatchingScale: 1,
            depthBuffer: true,
            minFilter: "NEAREST",
            magFilter: "NEAREST",
            wrapR: "CLAMP_TO_EDGE",
            wrapS: "CLAMP_TO_EDGE",
            wrapT: "CLAMP_TO_EDGE",
            internalFormat: "RGBA",
        })
        this.framebuffer.add(this.stamp)
        this.layer = new LayerPainter(context)
    }

    public readonly paint = (time: number, delay: number) => {
        const { context, color, framebuffer, layer } = this
        webglBlendExec(context.gl, webglPresetBlend.alpha, () => {
            framebuffer.paint(time, delay)
            layer.texture = framebuffer.texture
            layer.color.from(color)
            layer.paint()
        })
    }

    delete(): void {
        this.stamp.delete()
        this.framebuffer.delete()
        this.layer.delete()
    }
}
