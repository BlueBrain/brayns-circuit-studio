import clippingPlanes from "@/_old_/contract/service/brayns-api/clipping-planes"
import { HitTestResult } from "@/_old_/contract/service/brayns-api/hit-test"
import BraynsLightModuleInterface from "@/_old_/contract/service/brayns-api/light"
import { BraynsRendererModuleInterface } from "@/_old_/contract/service/brayns-api/renderer"
import JsonRpcServiceInterface, {
    isJsonRpcQueryFailure,
    LongTask,
} from "@/_old_/contract/service/json-rpc"
import CalcInterface, { Vector3, Vector4 } from "@/_old_/contract/tool/calc"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"
import Progress from "@/_old_/contract/type/progress"
import SerializableData from "@/_old_/contract/type/serializable-data"
import {
    assertType,
    isObject,
    isType,
    isVector3,
    isVector4,
} from "@/_old_/tool/validator"
import CameraModule from "./modules/camera"
import BraynsApiClippingPlanes from "./modules/clipping-planes"
import { hitTest } from "./modules/hit-test"
import BraynsLightModule from "./modules/light"
import BraynsRendererModule from "./modules/renderer"
import SnapshotModule from "./modules/snapshot"
/* eslint-disable camelcase */
import BraynsApiServiceInterface, {
    BraynsApiAddModelInput,
    BraynsApiAddModelOutput,
    BraynsApiAddSphereInput,
    BraynsApiGetApplicationParametersOutput,
    BraynsApiGetModelOutput,
    BraynsApiGetSceneOutput,
    BraynsApiGetSimulationParametersOutput,
    BraynsApiSetApplicationParametersInput,
    BraynsApiTransferFunction,
    BraynsApiUpdateModelInput,
    BraynsModelOutput,
    BraynsVersion,
} from "@/_old_/contract/service/brayns-api/brayns-api"
import {
    isBraynsApiAddModelOutputArray,
    isBraynsApiAddSphereOutput,
    isBraynsApiGetApplicationParametersOutput,
    isBraynsApiGetModelOutput,
    isBraynsApiGetSceneOutput,
    isBraynsApiGetSimulationParametersOutput,
    isBraynsApiGetVersionOutput,
    isInternalBraynsApiModelTransferFunction,
} from "./validator"
import { getFileExtension } from "../../tool/filename"
import { ModelColor } from "@/_old_/contract/manager/models/types/model-types"

const DEFAULT_PROGRESSIVE_SCALE = 10
export default class BraynsApiService extends BraynsApiServiceInterface {
    readonly clippingPlanes: clippingPlanes
    readonly camera: CameraModule
    readonly snapshot: SnapshotModule
    readonly renderer: BraynsRendererModuleInterface
    readonly light: BraynsLightModuleInterface

    private version: BraynsVersion | undefined
    private readonly cacheColorMethods = new Map<number, string[]>()

    constructor(
        public readonly jsonRpcService: JsonRpcServiceInterface,
        calc: CalcInterface,
        private readonly makeEvent: <T>() => TriggerableEventInterface<T>
    ) {
        super()
        this.clippingPlanes = new BraynsApiClippingPlanes(jsonRpcService)
        this.camera = new CameraModule(jsonRpcService, calc)
        this.snapshot = new SnapshotModule(jsonRpcService, calc, makeEvent)
        this.renderer = new BraynsRendererModule(jsonRpcService)
        this.light = new BraynsLightModule(jsonRpcService)
        void this.setProgressiveRendering(DEFAULT_PROGRESSIVE_SCALE)
    }

    async hitTest(x: number, y: number): Promise<HitTestResult> {
        return await hitTest(this.jsonRpcService, x, y)
    }

    /**
     * The first image of the rendering will have smaller viewport to
     * be faster.
     * @param scale Divide the viewport width and hieght by this number.
     */
    async setProgressiveRendering(scale: number): Promise<void> {
        await this.jsonRpcService.exec("set-framebuffer-progressive", {
            scale: Math.max(1, scale),
        })
    }

    async setMaterial(
        type: "phong" | "ghost",
        modelId: number,
        color: Vector4
    ): Promise<void> {
        switch (type) {
            case "phong":
                await this.jsonRpcService.exec("set-material-phong", {
                    model_id: modelId,
                    material: {},
                })
                break
            case "ghost":
                await this.jsonRpcService.exec("set-material-ghost", {
                    model_id: modelId,
                    material: {},
                })
                break
        }
        await this.jsonRpcService.exec("color-model", {
            id: modelId,
            method: "solid",
            values: { color },
        })
    }

    async getSceneBackgroundColor(): Promise<Vector4> {
        const data = await this.jsonRpcService.exec("get-renderer-interactive")
        const DEFAULT_COLOR: Vector4 = [0, 0, 0, 1]
        if (!isObject(data)) return DEFAULT_COLOR

        const color = data.background_color
        return isVector4(color) ? color : DEFAULT_COLOR
    }

    async setSceneBackgroundColor(color: Vector3 | Vector4): Promise<void> {
        await this.jsonRpcService.exec("set-renderer-interactive", {
            background_color: isVector3(color) ? [...color, 1] : color,
        })
    }

    async getVersion(): Promise<BraynsVersion> {
        if (!this.version) {
            // The version is a constant: we will read it only once.
            const data = await this.jsonRpcService.exec("get-version")
            if (!isBraynsApiGetVersionOutput(data)) {
                throw Error("Bad return format!")
            }
            this.version = data
        }
        return this.version
    }

    async addSphere(params: BraynsApiAddSphereInput): Promise<number> {
        const data = await this.jsonRpcService.exec(
            "add-sphere",
            params as unknown as SerializableData
        )
        if (!isBraynsApiAddSphereOutput(data)) {
            throw Error("Bad return format!")
        }
        return data.id
    }

    async getModelTransferFunction(
        modelId: number
    ): Promise<BraynsApiTransferFunction | undefined> {
        const data = await this.jsonRpcService.tryToExec("get-color-ramp", {
            id: modelId,
        })
        if (isJsonRpcQueryFailure(data)) {
            console.warn(
                `Model #${modelId} has no transfer function: ${data.message}`
            )
            return undefined
        }

        const { result } = data
        if (!isInternalBraynsApiModelTransferFunction(result))
            throw Error("Bad format!")
        return {
            colors: result.colors,
            range: {
                min: result.range[0],
                max: result.range[1],
            },
        }
    }

    async setModelTransferFunction(
        modelId: number,
        transferFunction: BraynsApiTransferFunction
    ): Promise<void> {
        await this.jsonRpcService.exec("set-color-ramp", {
            id: modelId,
            // eslint-disable-next-line camelcase
            color_ramp: {
                colors: transferFunction.colors,
                range: [transferFunction.range.min, transferFunction.range.max],
            },
        })
    }

    async initialize(): Promise<void> {
        await this.jsonRpcService.connect()
        await this.initializeRenderer()
    }

    async getSimulationParameters(): Promise<BraynsApiGetSimulationParametersOutput> {
        const data = await this.jsonRpcService.exec("get-simulation-parameters")
        if (!isBraynsApiGetSimulationParametersOutput(data)) {
            throw Error("Bad format!")
        }
        return data
    }

    async setAnimationParameters(
        params: Partial<BraynsApiGetSimulationParametersOutput>
    ): Promise<void> {
        await this.jsonRpcService.exec("set-simulation-parameters", params)
    }

    async updateModel(params: BraynsApiUpdateModelInput): Promise<void> {
        const inputs = {
            model_id: params.id,
            model: {
                is_visible: params.visible,
                transform: params.transform,
            },
        }
        await this.jsonRpcService.exec("update-model", inputs)
    }

    async addModel(
        params: BraynsApiAddModelInput,
        onTaskReady: (task: LongTask) => void,
        data?: string | ArrayBuffer
    ): Promise<BraynsModelOutput[] | null> {
        try {
            const eventProgress = this.makeEvent<Progress>()
            const asyncCall = data
                ? this.jsonRpcService.execLongTask(
                      "upload-model",
                      {
                          loader_name: params.loader_name,
                          loader_properties: params.loader_properties,
                          type: getFileExtension(params.path),
                      },
                      eventProgress.trigger,
                      data
                  )
                : this.jsonRpcService.execLongTask(
                      "add-model",
                      params,
                      eventProgress.trigger
                  )
            onTaskReady(asyncCall)
            const braynsModels = await waitForAsyncResultFromAddModel(asyncCall)
            if (!braynsModels) return null

            return braynsModels.map((item) => {
                const result: BraynsModelOutput = {
                    ...item,
                    loader: {
                        path: params.path,
                        name: params.loader_name,
                        properties: params.loader_properties,
                    },
                }
                return result
            })
        } catch (ex) {
            console.log("🚀 [brayns-api-service] ex = ", ex) // @FIXME: Remove this line written on 2024-01-31 at 10:25
            throw ex
        }
    }

    async removeModel(modelIds: number[]): Promise<boolean> {
        const result = await this.jsonRpcService.exec("remove-model", {
            ids: modelIds,
        })
        if (!result) return false

        modelIds.forEach((id) => this.cacheColorMethods.delete(id))
        return true
    }

    async getModel(modelId: number): Promise<BraynsApiGetModelOutput> {
        const data = await this.jsonRpcService.exec("get-model", {
            id: modelId,
        })
        if (!isBraynsApiGetModelOutput(data)) throw Error("Bad format!")
        return data
    }

    async getScene(): Promise<BraynsApiGetSceneOutput> {
        const data = await this.jsonRpcService.exec("get-scene")
        if (!isBraynsApiGetSceneOutput(data)) throw Error("Bad format!")
        return data
    }

    async setApplicationParameters(
        params: BraynsApiSetApplicationParametersInput
    ): Promise<boolean> {
        const result = await this.jsonRpcService.exec(
            "set-application-parameters",
            params as unknown as SerializableData
        )
        return result === true
    }

    async getApplicationParameters(): Promise<BraynsApiGetApplicationParametersOutput> {
        const data = await this.jsonRpcService.exec(
            "get-application-parameters"
        )
        if (!isBraynsApiGetApplicationParametersOutput(data))
            throw Error("Bad format!")
        return data
    }

    async setColor(modelId: number, colors: ModelColor): Promise<void> {
        try {
            await this.jsonRpcService.exec("color-model", {
                id: modelId,
                ...colors,
            })
        } catch (ex) {
            if (isBraynsError(ex) && ex.code === -32603) {
                const methods = await this.getColorMethods(modelId)
                ex.message += `\nAvailable coloring methods: ${methods
                    .map((name) => `"${name}"`)
                    .join(", ")}.`
            }
            console.log("🚀 [brayns-api-service] ex = ", ex) // @FIXME: Remove this line written on 2024-02-22 at 10:16
            throw ex
        }
    }

    async getColorMethods(modelId: number): Promise<string[]> {
        const fromCache = this.cacheColorMethods.get(modelId)
        if (fromCache) return fromCache

        const data = await this.jsonRpcService.exec("get-color-methods", {
            id: modelId,
        })
        assertType<string[]>(data, ["array", "string"])
        this.cacheColorMethods.set(modelId, data)
        return data
    }

    private async initializeRenderer(): Promise<void> {
        await this.renderer.set({
            type: "interactive",
            ambientOcclusionSamples: 3,
            backgroundColor: [0.0027, 0.0161, 0.0271, 1],
            enableShadows: false,
            maxRayBounces: 1,
            samplesPerPixel: 1,
        })
        await this.setProgressiveRendering(DEFAULT_PROGRESSIVE_SCALE)
    }
}

function isBraynsError(
    data: unknown
): data is { code: number; message: string } {
    return isType(data, { code: "number", message: "string" })
}

function waitForAsyncResultFromAddModel(asyncCall: LongTask) {
    return new Promise<BraynsApiAddModelOutput[] | null>((resolve, reject) => {
        asyncCall.promise
            .then((rawData: unknown) => {
                // Brayns service can return a single model or an array.
                const data = Array.isArray(rawData) ? rawData : [rawData]
                if (!isBraynsApiAddModelOutputArray(data)) {
                    asyncCall.cancel()
                    reject(Error("Bad model format!"))
                    return
                }
                resolve(data)
            })
            .catch((error) => {
                asyncCall.cancel()
                reject(error)
            })
    })
}
