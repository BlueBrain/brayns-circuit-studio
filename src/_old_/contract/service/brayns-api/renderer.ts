import { Vector4 } from "@/_old_/contract/tool/calc"

export type Renderer = RendererInteractive | RendererProduction

export interface RendererInteractive {
    type?: "interactive"
    /** Sets number of samples to compute ambient occlusionINT. */
    ambientOcclusionSamples?: number
    /** Background colorARRAY[4] of NUMBER. */
    backgroundColor?: Vector4
    /** Render casted shadowsBOOLEAN. */
    enableShadows?: boolean
    /** Max ray bounces per sampleINT. */
    maxRayBounces?: number
    /** Number of samples per pixelINT     . */
    samplesPerPixel?: number
    /** The dimension of the next image to render. */
    viewPort?: [width: number, height: number]
}

export interface RendererProduction {
    type?: "production"
    /** Background colorARRAY[4] of NUMBER. */
    backgroundColor?: Vector4
    /** Max ray bounces per sampleINT. */
    maxRayBounces?: number
    /** Number of samples per pixelINT     . */
    samplesPerPixel?: number
    /** The dimension of the next image to render. */
    viewPort?: [width: number, height: number]
}

export interface RendererResult {
    frame?: HTMLImageElement
    sizeInBytes: number
    progress: number
}

export interface RendererResultOption {
    renderEvenIfNothingHasChanged: boolean
    prepareImageWithoutSendingIt: boolean
}

export interface BraynsRendererModuleInterface {
    /**
     * Set Brayns' renderer parameters.
     */
    set(rendererParams: Renderer): Promise<void>

    trigger(options: RendererResultOption): Promise<RendererResult>
}
