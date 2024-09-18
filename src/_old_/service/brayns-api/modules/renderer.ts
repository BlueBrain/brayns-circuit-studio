import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import {
    BraynsRendererModuleInterface,
    RendererInteractive,
    RendererResult,
    RendererResultOption,
} from "@/_old_/contract/service/brayns-api/renderer"
import {
    assertNumber,
    assertObject,
    assertOptionalArrayBuffer,
} from "@/_old_/tool/validator"

export default class BraynsRendererModule
    implements BraynsRendererModuleInterface
{
    constructor(private readonly brayns: JsonRpcServiceInterface) {}

    async trigger(options: RendererResultOption): Promise<RendererResult> {
        const send = !options.prepareImageWithoutSendingIt
        const force = options.renderEvenIfNothingHasChanged
        const data = await this.brayns.exec("render-image", {
            send,
            force,
            format: "jpg",
        })
        assertObject(data)
        assertNumber(data.accumulation, "data.accumulation")
        assertNumber(data.max_accumulation, "data.max_accumulation")
        assertOptionalArrayBuffer(data.$data)
        let frame: HTMLImageElement | undefined = undefined
        if (data.$data) {
            const blob = new Blob([data.$data], { type: "image/jpeg" })
            const url = window.URL.createObjectURL(blob)
            frame = await loadImage(url)
            // window.setTimeout(() => window.URL.revokeObjectURL(url), 5000)
            window.URL.revokeObjectURL(url)
        }
        const result: RendererResult = {
            frame,
            sizeInBytes: data.$data?.byteLength ?? 0,
            progress: data.accumulation / data.max_accumulation,
        }
        return result
    }

    async set(rendererParams: RendererInteractive): Promise<void> {
        if (rendererParams.type === "interactive") {
            const params = {
                ao_samples: rendererParams.ambientOcclusionSamples,
                background_color: rendererParams.backgroundColor,
                enable_shadows: rendererParams.enableShadows,
                max_ray_bounces: rendererParams.maxRayBounces,
                samples_per_pixel: rendererParams.samplesPerPixel,
            }
            if (typeof params.background_color === "undefined") {
                // Brayns does not accept undefined values.
                delete params.background_color
            }
            await this.brayns.exec("set-renderer-interactive", params)
        } else if (rendererParams.type === "production") {
            const params = {
                background_color: rendererParams.backgroundColor,
                max_ray_bounces: rendererParams.maxRayBounces,
                samples_per_pixel: rendererParams.samplesPerPixel,
            }
            if (typeof params.background_color === "undefined") {
                // Brayns does not accept undefined values.
                delete params.background_color
            }
            await this.brayns.exec("set-renderer-production", params)
        }
        if (rendererParams.viewPort) {
            const MINIMAL_VIEWPORT_SIZE = 64
            const [width, height] = rendererParams.viewPort
            await this.brayns.exec("set-application-parameters", {
                viewport: [
                    Math.max(MINIMAL_VIEWPORT_SIZE, Math.ceil(width)),
                    Math.max(MINIMAL_VIEWPORT_SIZE, Math.ceil(height)),
                ],
            })
        }
    }
}

async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const img = new Image()
        img.src = url
        img.onload = () => resolve(img)
        img.onerror = () => {
            console.error("Unable to load an image from binary data!")
            resolve(new Image())
        }
    })
}
