import * as React from "react"
import CalcInterface, { Vector4 } from "@/_old_/contract/tool/calc"
import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import Progress from "@/_old_/contract/type/progress"
import ProgressView from "@/_old_/view/progress"
import { BraynsApiSnapshotInput } from "@/_old_/contract/service/brayns-api/brayns-api"
import { EMPTY_FUNCTION } from "@/_old_/constants"
import { isBraynsApiSnapshotOutput } from "../validator"
import { isObject, isVector4 } from "@/_old_/tool/validator"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"
import SnapshotModuleInterface, {
    BraynsSnapshotInput,
    BraynsSnapshotQualityEnum,
} from "@/_old_/contract/service/brayns-api/snapshot"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"

export default class SnapshotModule implements SnapshotModuleInterface {
    constructor(
        private readonly brayns: JsonRpcServiceInterface,
        private readonly calc: CalcInterface,
        private readonly makeEvent: <T>() => TriggerableEventInterface<T>
    ) {}

    async takeImage(params: BraynsSnapshotInput): Promise<HTMLImageElement> {
        const [width, height] = params.size
        if (width < 64 || height < 64) return new Image()

        const data = await this.brayns.exec(
            "snapshot",
            await makeSnapshotEntrypointParams(params, this.calc, this.brayns)
        )
        if (!isBraynsApiSnapshotOutput(data)) throw Error("Bad format!")
        const blob = new Blob([data.$data], { type: "image/jpeg" })
        const url = window.URL.createObjectURL(blob)
        const image = await loadImage(url, ...params.size)
        window.URL.revokeObjectURL(url)
        return image
    }

    async takeCancellableImage(params: BraynsSnapshotInput): Promise<{
        cancel: () => void
        promisedImage: Promise<HTMLImageElement | null>
    }> {
        const [width, height] = params.size
        if (width < 64 || height < 64)
            return {
                cancel: EMPTY_FUNCTION,
                promisedImage: new Promise((resolve) => resolve(null)),
            }

        const eventProgress = this.makeEvent<Progress>()
        const task = this.brayns.execLongTask(
            "snapshot",
            await makeSnapshotEntrypointParams(params, this.calc, this.brayns),
            eventProgress.trigger
        )
        return {
            cancel: () => task.cancel(),
            promisedImage: new Promise((resolve, reject) => {
                task.promise
                    .then((data) => {
                        if (!isBraynsApiSnapshotOutput(data)) {
                            reject(Error("Bad snapshot format!"))
                            console.error("Bad snapshot format:", data)
                            return
                        }
                        const blob = new Blob([data.$data], {
                            type: "image/jpeg",
                        })
                        const url = window.URL.createObjectURL(blob)
                        loadImage(url, width, height)
                            .then((image: HTMLImageElement) => {
                                window.URL.revokeObjectURL(url)
                                resolve(image)
                            })
                            .catch((err) => {
                                console.error(err)
                                reject(err)
                            })
                    })
                    .catch(reject)
            }),
        }
    }

    async takeImageWithCancelOption(
        params: BraynsSnapshotInput,
        modal: ModalManagerInterface
    ): Promise<HTMLImageElement | null> {
        const [width, height] = params.size
        if (width < 64 || height < 64)
            return new Promise((resolve) => resolve(null))

        const eventProgress = this.makeEvent<Progress>()
        const task = this.brayns.execLongTask(
            "snapshot",
            await makeSnapshotEntrypointParams(params, this.calc, this.brayns),
            eventProgress.trigger
        )
        return new Promise<HTMLImageElement | null>((resolve, reject) => {
            const handleCancel = async () => {
                const confirm = await modal.confirm({
                    content: "Are you sure you want to cancel this snapshot?",
                    labelOK: "Yes, cancel it!",
                    labelCancel: "No, please proceed",
                    align: "T",
                })
                if (!confirm) return

                hide()
                task.cancel()
                resolve(null)
            }
            const hide = modal.show({
                content: (
                    <ProgressView
                        eventProgress={eventProgress}
                        onCancel={() => void handleCancel()}
                    />
                ),
            })
            task.promise
                .then((data) => {
                    hide()
                    if (!isBraynsApiSnapshotOutput(data))
                        throw Error("Bad snapshot format!")
                    const blob = new Blob([data.$data], {
                        type: "image/jpeg",
                    })
                    const url = window.URL.createObjectURL(blob)
                    loadImage(url, width, height)
                        .then((image: HTMLImageElement) => {
                            window.URL.revokeObjectURL(url)
                            resolve(image)
                        })
                        .catch(console.error)
                })
                .catch((err) => {
                    hide()
                    reject(err)
                })
        })
    }
}

async function makeSnapshotEntrypointParams(
    params: BraynsSnapshotInput,
    calc: CalcInterface,
    brayns: JsonRpcServiceInterface
): Promise<BraynsApiSnapshotInput> {
    const background: Vector4 = await getSceneBackground(brayns)
    const output: BraynsApiSnapshotInput = {
        image_settings: {
            size: params.size,
            format: params.transparent ? "png" : "jpg",
            quality: getImageQuality(params),
        },
        renderer: getRendererFromQuality(
            params.quality,
            params.transparent ? undefined : background
        ),
    }
    if (params.camera) {
        const axis = calc.getAxisFromQuaternion(params.camera.orientation)
        output.camera_view = {
            position: calc.addVectors(
                params.camera.target,
                calc.scaleVector(axis.z, params.camera.distance)
            ),
            target: params.camera.target,
            up: axis.y,
        }
    }
    if (params.projection) {
        if (params.projection.type === "orthographic") {
            output.camera = {
                name: "orthographic",
                params: { height: params.projection.height },
            }
        } else if (params.projection.type === "perspective") {
            output.camera = {
                name: "perspective",
                params: { fov: params.projection.fieldOfView },
            }
        }
    }
    return output
}

function getRendererFromQuality(
    quality: BraynsSnapshotQualityEnum,
    background?: Vector4
) {
    switch (quality) {
        case BraynsSnapshotQualityEnum.Low:
            return {
                name: "interactive",
                params: {
                    ao_samples: 0,
                    enable_shadows: false,
                    max_ray_bounces: 0,
                    samples_per_pixel: 1,
                    background_color: background,
                },
            }
        case BraynsSnapshotQualityEnum.Medium:
            return {
                name: "interactive",
                params: {
                    ao_samples: 5,
                    enable_shadows: false,
                    max_ray_bounces: 2,
                    samples_per_pixel: 2,
                    background_color: background,
                },
            }
        case BraynsSnapshotQualityEnum.High:
            return {
                name: "interactive",
                params: {
                    ao_samples: 8,
                    enable_shadows: true,
                    max_ray_bounces: 2,
                    samples_per_pixel: 4,
                    background_color: background,
                },
            }
        // return {
        //     name: "production",
        //     params: {
        //         max_ray_bounces: 8,
        //         samples_per_pixel: 32,
        //         background_color: background,
        //     },
        // }
    }
}

function getImageQuality(params: BraynsSnapshotInput) {
    switch (params.quality) {
        case BraynsSnapshotQualityEnum.High:
            return 100
        case BraynsSnapshotQualityEnum.Medium:
            return 85
        default:
            return 70
    }
}

function loadImage(
    url: string,
    width: number,
    height: number
): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.width = width
        img.height = height
        img.src = url
        img.onerror = reject
        img.onload = () => resolve(img)
    })
}

async function getSceneBackground(
    brayns: JsonRpcServiceInterface
): Promise<Vector4> {
    const result = await brayns.exec("get-renderer-interactive")
    if (!isObject(result)) return [0, 0, 0, 1]
    const { background_color } = result
    return isVector4(background_color) ? background_color : [0, 0, 0, 1]
}
