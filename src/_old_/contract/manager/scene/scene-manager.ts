import CameraModuleInterface from "../camera"
import GenericEvent from "@/_old_/contract/tool/event"
import ImageStreamInterface from "../image-stream"
import ModelsManagerInterface from "@/_old_/contract/manager/models"
import { ClippingPlane } from "../../../manager/scene/clipping-planes/clipping-planes"
import { isNumber, isObject } from "@/_old_/tool/validator"
import { ProgressHandler } from "../../type/progress"
import { SceneObjectsManagerInterface } from "./scene-objects"
import { Vector3, Vector4 } from "@/_old_/contract/tool/calc"
import SceneColorrampInterface from "./scene-colorramp"

export interface CameraFocusSettings {
    /** Used for orthographic camera. */
    height: number
    orientation: [number, number, number, number]
    position: [number, number, number]
    target: [number, number, number]
}

export interface ClippingPlanesModuleInterface {
    /**
     * Remove all existing clipping planes.
     */
    clear(): Promise<void>

    /**
     * Create a clipping plane and return its Id.
     * @params center - Any point of this plane.
     * @params direction -  Normal vector of this plane.
     */
    add(center: Vector3, direction: Vector3): Promise<number>

    /**
     * React hook that wathces the list of clipping planes.
     */
    useClippingPlanes(): ClippingPlane[]
}

export interface SimulationModuleInterface {
    readonly eventChange: GenericEvent<SimulationModuleInterface>
    /** Is playback on? */
    playing: boolean
    /** Number of simulation steps per second. */
    speed: number
    /**
     * The step currently displayed.
     * The first step is always 0, regardless what the real first step is in Brayns.
     * Proper shifting will be performed in background.
     */
    currentStep: number
    /** Simulation is enabled only if a report has been loaded. */
    readonly enabled: boolean
    readonly stepsCount: number
    readonly timeBetweenSteps: number
    readonly timeUnit: string
    /** Ask Brayns for all the current simulation parameters. */
    reloadParameters(): Promise<void>
}

export interface PerspectiveProjection {
    type: "perspective"
    /**
     * Whole angle between top and bottom planes in the frustrum.
     * This is expressed in degrees.
     */
    fieldOfView: number
}

export interface OrthographicProjection {
    type: "orthographic"
    /** Height of the view in space units. */
    height: number
}

export function ensureSceneManagerInterface(
    data: unknown
): SceneManagerInterface {
    if (data instanceof SceneManagerInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type SceneManagerInterface!")
}

/**
 * The scene manager keep track of loaded models, lights, clipping planes, ...
 */
export default abstract class SceneManagerInterface {
    /**
     * This method has to be called before using the object.
     * If the object is already initialized, this call will do nothing.
     */
    abstract initialize(): Promise<void>

    /**
     * Compute camera position/orientation to see all the models.
     * This is based on the bouding box of each model.
     */
    abstract focusOnModel(modelIds: number[]): Promise<void>

    /**
     * Remove all models, lights, clipping planes from the scene.
     * Restore default lights, camera, renderer.
     */
    abstract reset(onProgress?: ProgressHandler): Promise<void>

    /**
     * Set background color.
     */
    abstract backgroundColorSet(color: Vector3 | Vector4): Promise<void>
    /**
     * Get current background color.
     */
    abstract backgroundColorGet(): Promise<Vector3>

    abstract readonly colorramp: SceneColorrampInterface

    abstract readonly clippingPlanes: ClippingPlanesModuleInterface

    abstract readonly simulation: SimulationModuleInterface

    abstract readonly camera: CameraModuleInterface

    abstract readonly imageStream: ImageStreamInterface

    abstract readonly objects: SceneObjectsManagerInterface

    abstract readonly models: ModelsManagerInterface
}

export function isOrthographicProjection(
    data: unknown
): data is OrthographicProjection {
    return (
        isObject(data) && data.type === "orthographic" && isNumber(data.height)
    )
}

export function isPerspectiveProjection(
    data: unknown
): data is PerspectiveProjection {
    return (
        isObject(data) &&
        data.type === "perspective" &&
        isNumber(data.fieldOfView)
    )
}
