import { assertType } from "@tolokoban/type-guards"
import JsonRpcService from "./json-rpc"
import { imageLoad } from "@/util/image"

export interface SnapshotOptions {
    width: number
    height: number
}

export class Renderer {
    constructor(private readonly getBrayns: () => JsonRpcService) {}

    async snapshot({
        width,
        height,
    }: SnapshotOptions): Promise<HTMLImageElement | null> {
        const brayns = this.getBrayns()
        const data = await brayns.exec("snapshot", {
            image_settings: {
                quality: 80,
                format: "jpg",
                size: [width, height],
            },
            renderer: {
                name: "interactive",
                params: {
                    ao_samples: 3,
                    background_color: [0.004, 0.016, 0.102, 0],
                    enable_shadows: false,
                    max_ray_bounces: 1,
                    samples_per_pixel: 2,
                },
            },
        })
        assertType<{ $data: ArrayBuffer }>(data, {
            $data: "unknown",
        })
        const blob = new Blob([data.$data], { type: "image/jpeg" })
        const url = window.URL.createObjectURL(blob)
        const image = await imageLoad(url)
        window.URL.revokeObjectURL(url)
        return image
    }
}
