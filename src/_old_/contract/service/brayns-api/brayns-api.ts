import BraynsApiClippingPlanesInterface from "./clipping-planes"
import BraynsLightModuleInterface from "./light"
import JsonRpcServiceInterface, { LongTask } from "../json-rpc"
import SnapshotModuleInterface from "./snapshot"
import {
    BoundingBox,
    Quaternion,
    Vector3,
    Vector4,
} from "@/_old_/contract/tool/calc"
import { BraynsApiCamera } from "./camera"
import { BraynsRendererModuleInterface } from "./renderer"
import { HitTestResult } from "./hit-test"
import { ModelColor } from "@/_old_/contract/manager/models/types/model-types"

export interface BraynsVersion {
    major: number
    minor: number
    patch: number
    revision: string
}

export function ensureBraynsApiServiceInterface(
    data: unknown
): BraynsApiServiceInterface {
    if (data instanceof BraynsApiServiceInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type BraynsApiServiceInterface!")
}

export default abstract class BraynsApiServiceInterface {
    abstract readonly jsonRpcService: JsonRpcServiceInterface
    abstract readonly snapshot: SnapshotModuleInterface
    abstract readonly clippingPlanes: BraynsApiClippingPlanesInterface
    abstract readonly camera: BraynsApiCamera
    abstract readonly renderer: BraynsRendererModuleInterface
    abstract readonly light: BraynsLightModuleInterface

    /**
     * The first image of the rendering will have smaller viewport to
     * be faster.
     * @param scale Divide the viewport width and hieght by this number.
     */
    abstract setProgressiveRendering(scale: number): Promise<void>

    /**
     * Connect to Brayns Service.
     */
    abstract initialize(): Promise<void>

    /**
     * @returns What is hit at a given pixel of the screen.
     * @param x 0 is the left of the screen, 1 is the right.
     * @param y 0 is the bottom of the screen, 1 is the top.
     */
    abstract hitTest(x: number, y: number): Promise<HitTestResult>

    /**
     * Adding a model can take a lot of time.
     * That's why this action is cancellable.
     * @param data If defined, it is the content to load.
     * And in this case, `path` is only used as a hint on
     * the type of content (based on the file extension
     * most of the time).
     * @returns `null` if the process has been cancelled.
     */
    abstract addModel(
        params: BraynsApiAddModelInput,
        onTaskReady: (task: LongTask) => void,
        data?: string | ArrayBuffer
    ): Promise<BraynsModelOutput[] | null>
    abstract updateModel(params: BraynsApiUpdateModelInput): Promise<void>
    abstract getModel(modelId: number): Promise<BraynsApiGetModelOutput>
    /**
     * Add a mathematical sphere and get the model's id.
     * @param color Color in [Red, Green, Blue, Alpha].
     * @returns ID of the resulting model.
     */
    abstract addSphere(params: BraynsApiAddSphereInput): Promise<number>
    abstract getScene(): Promise<BraynsApiGetSceneOutput>
    abstract removeModel(modelIds: number[]): Promise<boolean>

    abstract setApplicationParameters(
        params: BraynsApiSetApplicationParametersInput
    ): Promise<boolean>
    abstract getApplicationParameters(): Promise<BraynsApiGetApplicationParametersOutput>

    abstract getSimulationParameters(): Promise<BraynsApiGetSimulationParametersOutput>
    abstract setAnimationParameters(
        params: BraynsApiSetSimulationParametersInput
    ): Promise<void>

    /**
     * @returns The transfer function of a given model, or `undefined` if this model
     * does not have any transfer function.
     */
    abstract getModelTransferFunction(
        modelId: number
    ): Promise<BraynsApiTransferFunction | undefined>
    abstract setModelTransferFunction(
        modelId: number,
        tansferFunction: BraynsApiTransferFunction
    ): Promise<void>
    abstract getVersion(): Promise<BraynsVersion>
    abstract getSceneBackgroundColor(): Promise<Vector4>
    abstract setSceneBackgroundColor(color: Vector3 | Vector4): Promise<void>

    abstract setMaterial(
        type: "phong" | "ghost",
        modelId: number,
        color: Vector4
    ): Promise<void>

    abstract setColor(modelId: number, colors: ModelColor): Promise<void>

    abstract getColorMethods(modelId: number): Promise<string[]>
}

export interface BraynsModelOutput extends BraynsApiAddModelOutput {
    loader: {
        path: string
        /** Name of the loader */
        name: string
        properties: unknown
    }
}

export interface BraynsApiGenericMaterial {
    clippingMode: "No clipping" | "Plane" | "Sphere"
    diffuseColor: Vector3
    emission?: number
}

export interface BraynsApiTransferFunction {
    range: {
        min: number
        max: number
    }
    colors: Vector4[]
}

export interface BraynsApiAddModelInput {
    loader_name: string
    loader_properties: unknown
    path: string
}

export interface BraynsApiAddModelOutput {
    bounds: BoundingBox
    is_visible: boolean
    info: {
        base_transform: {
            rotation: Quaternion
            scale: Vector3
            translation: Vector3
        }
        load_info: {
            load_parameters: unknown
            load_name: string
            path: string
            source: "from_file" | "from_blob" | "none"
        }
        metadata: { [key: string]: string }
    }
    model_id: number
    model_type: string
    transform: {
        rotation: Quaternion
        scale: Vector3
        translation: Vector3
    }
}

export interface BraynsApiUpdateModelInput {
    id: number
    bounding_box?: boolean
    name?: string
    transform?: {
        rotation?: Quaternion
        scale?: Vector3
        translation?: Vector3
    }
    visible?: boolean
}

export interface BraynsApiAddSphereInput {
    center: Vector3
    radius: number
    // [red, green, blue, alpha] all components are real numbers between 0 and 1.
    color: Vector4
}

export interface BraynsApiAddSphereOutput {
    id: number
}

export interface BraynsApiSetApplicationParametersInput {
    engine?: string
    jpeg_quality?: number
    viewport?: [number, number]
}

export interface BraynsApiGetApplicationParametersOutput {
    viewport: [number, number]
    plugins: string[]
}

export interface BraynsApiGetModelOutput {
    bounds: BoundingBox
    info?: {
        base_transform?: {
            rotation: Quaternion
            scale: Vector3
            translation: Vector3
        }
        load_info?: {
            load_parameters: Record<string, unknown>
            loader_name: string
            path: string
            source: string
        }
        metadata?: { [key: string]: string }
    }
    is_visible: boolean
    model_id: number
    transform: {
        rotation: Quaternion
        scale: Vector3
        translation: Vector3
    }
}

export interface BraynsApiGetSceneOutput {
    bounds: BoundingBox
    models: BraynsApiGetModelOutput[]
}

export interface BraynsApiGetStatisticsOutput {
    fps: number
    scene_size_in_bytes: number
}

export interface BraynsApiGetSimulationParametersOutput {
    /**
     * Current step index.
     * * min = 0
     * * max = end_frame - start_frame - 1
     */
    current: number
    /** Time between two simulation steps. */
    dt: number
    /** Index of the first simulation frame. */
    start_frame: number
    /** One more than the index of the last simulation frame. */
    end_frame: number
    /** Time unit. */
    unit: string
}

export type BraynsApiSetSimulationParametersInput =
    Partial<BraynsApiGetSimulationParametersOutput>

export interface BraynsApiSnapshotInput {
    camera?: {
        name?: string
        params?: { [key: string]: unknown }
    }
    camera_view?: {
        position: Vector3
        target: Vector3
        up: Vector3
    }
    file_path?: string
    image_settings?: {
        format?: "jpg" | "png"
        quality?: number
        size?: [width: number, height: number]
    }
    renderer?: {
        name?: string
        params?: { [key: string]: unknown }
    }
    simulation_frame?: number
}

export interface BraynsApiSnapshotOutput {
    $data: ArrayBuffer
    color_buffer: {
        offset: number
        size: number
    }
}

export interface BraynsApiGetRendererOutput {
    accumulation: boolean
    background_color: Vector3
    current: string
    head_light: boolean
    max_accum_frames: number
    samples_per_pixel: number
    subsampling: number
    types: string[]
    variance_threshold: number
}
