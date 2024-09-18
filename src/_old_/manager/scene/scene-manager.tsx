import CameraManagerInterface from "@/_old_/contract/manager/camera"
import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import ModelsManagerInterface from "@/_old_/contract/manager/models"
import SceneManagerInterface, {
    ClippingPlanesModuleInterface,
    SimulationModuleInterface,
} from "@/_old_/contract/manager/scene"
import { SceneObjectsManagerInterface } from "@/_old_/contract/manager/scene/scene-objects"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import CalcInterface, {
    BoundingBox,
    Vector3,
    Vector4,
} from "@/_old_/contract/tool/calc"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"
import { ProgressHandler } from "@/_old_/contract/type/progress"
import { half } from "../../constants"
import SceneColorrampInterface from "../../contract/manager/scene/scene-colorramp"
import ClippingPlanes from "./clipping-planes"
import Colorramp from "./colorramp"
import ObjectsManager from "./objects/objects-manager"
import SimulationManager from "./simulation"

/* eslint-disable class-methods-use-this */
export default class SceneManager extends SceneManagerInterface {
    public readonly objects: SceneObjectsManagerInterface
    public readonly simulation: SimulationModuleInterface
    public readonly clippingPlanes: ClippingPlanesModuleInterface
    public readonly colorramp: SceneColorrampInterface

    private _initialized = false

    constructor(
        private readonly brayns: BraynsApiServiceInterface,
        public readonly models: ModelsManagerInterface,
        sessionStorage: SessionStorageServiceInterface,
        public readonly camera: CameraManagerInterface,
        public readonly imageStream: ImageStreamInterface,
        public readonly calc: CalcInterface,

        makeEvent: <T>() => TriggerableEventInterface<T>
    ) {
        super()
        this.colorramp = new Colorramp(this.brayns.jsonRpcService)
        this.clippingPlanes = new ClippingPlanes(
            this.brayns,
            calc,
            sessionStorage
        )
        this.simulation = new SimulationManager(
            this.brayns,
            () => void this.imageStream.askForNextFrame(),
            makeEvent
        )
        this.objects = new ObjectsManager(
            this.brayns.jsonRpcService,
            calc,
            sessionStorage
        )
        models.circuit.eventChange.add(
            () => void this.simulation.reloadParameters()
        )
        void this.simulation.reloadParameters()
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async initialize() {
        if (this._initialized) return

        // Ask for new render when the camera moves.
        const triggerRenderer = () => void this.imageStream.askForNextFrame()
        this.camera.eventChange.add(triggerRenderer)
        // Mark as initialized to prevent doing it twice.
        this._initialized = true
    }

    async focusOnModel(modelIds: number[]): Promise<void> {
        if (modelIds.length < 1) return

        const { calc } = this
        const [firstModelId, ...restIds] = modelIds
        const { brayns } = this
        const model = await brayns.getModel(firstModelId)
        let [xMin, yMin, zMin] = model.bounds.min
        let [xMax, yMax, zMax] = model.bounds.max
        for (const modelId of restIds) {
            const model = await brayns.getModel(modelId)
            const [x1, y1, z1] = model.bounds.min
            xMin = Math.min(xMin, x1)
            yMin = Math.min(yMin, y1)
            zMin = Math.min(zMin, z1)
            const [x2, y2, z2] = model.bounds.max
            xMax = Math.max(xMax, x2)
            yMax = Math.max(yMax, y2)
            zMax = Math.max(zMax, z2)
        }
        const target: Vector3 = [
            half(xMin + xMax),
            half(yMin + yMax),
            half(zMin + zMax),
        ]
        const [xxMin, yyMin, zzMin] = calc.rotateVectorWithQuaternion(
            [xMin, yMin, zMin],
            this.camera.params.orientation
        )
        const [xxMax, yyMax, zzMax] = calc.rotateVectorWithQuaternion(
            [xMax, yMax, zMax],
            this.camera.params.orientation
        )
        const scaleY = Math.abs(yyMax - yyMin) / this.camera.viewport.height
        const scaleX = Math.abs(xxMax - xxMin) / this.camera.viewport.width
        const height = this.camera.viewport.height * Math.max(scaleX, scaleY)
        const distance = 10 * Math.abs(zzMax - zzMin)
        this.camera.params = {
            ...this.camera.params,
            type: "orthographic",
            height,
            distance,
            target,
        }
    }

    async getModelBoundingBox(modelId: number): Promise<BoundingBox> {
        const { brayns } = this
        const data = await brayns.getModel(modelId)
        return data.bounds
    }

    async reset(onProgress?: ProgressHandler): Promise<void> {
        const triggerProgress = (value: number, label?: string) => {
            if (!onProgress) return
            onProgress({ value, label })
        }
        try {
            const { brayns } = this
            const circuitIds = await this.models.circuit.getIds()
            const meshIds = await this.models.mesh.getIds()
            const morphologyIds = await this.models.morphology.getIds()
            const steps =
                5 + circuitIds.length + meshIds.length + morphologyIds.length
            let step = 1
            step = await resetCircuits(
                triggerProgress,
                step,
                steps,
                circuitIds,
                this.models
            )
            step = await resetMeshes(
                triggerProgress,
                step,
                steps,
                meshIds,
                this.models
            )
            step = await resetMorphologies(
                triggerProgress,
                step,
                steps,
                morphologyIds,
                this.models
            )
            await brayns.jsonRpcService.exec("clear-models")
            triggerProgress(step++ / steps, "Removing clipping planes...")
            await brayns.clippingPlanes.clear()
            triggerProgress(step++ / steps, "Setting renderer...")
            // @TODO: Setting renderer
            triggerProgress(step++ / steps, "Setting orthographic camera...")
            this.camera.reset()
        } catch (ex) {
            console.error(ex)
            throw ex
        }
    }

    async backgroundColorGet(): Promise<Vector3> {
        const [r, g, b] = await this.brayns.getSceneBackgroundColor()
        return [r, g, b]
    }

    async backgroundColorSet(color: Vector3 | Vector4): Promise<void> {
        const [r, g, b] = color
        await this.brayns.setSceneBackgroundColor([r, g, b])
    }
}

async function resetMorphologies(
    triggerProgress: (value: number, label?: string) => void,
    step: number,
    steps: number,
    morphologyIds: number[],
    models: ModelsManagerInterface
) {
    triggerProgress(step++ / steps, "Removing morphologies...")
    for (const morphologyId of morphologyIds) {
        try {
            triggerProgress(step++ / steps, "Removing morphologies...")
            await models.morphology.remove(morphologyId)
        } catch (ex) {
            // Ignore remove error, but log it in the console.
            console.error(ex)
        }
    }
    return step
}

async function resetMeshes(
    triggerProgress: (value: number, label?: string) => void,
    step: number,
    steps: number,
    meshIds: number[],
    models: ModelsManagerInterface
) {
    triggerProgress(step++ / steps, "Removing meshes...")
    for (const meshId of meshIds) {
        try {
            triggerProgress(step++ / steps, "Removing meshes...")
            await models.mesh.remove(meshId)
        } catch (ex) {
            // Ignore remove error, but log it in the console.
            console.error(ex)
        }
    }
    return step
}

async function resetCircuits(
    triggerProgress: (value: number, label?: string) => void,
    step: number,
    steps: number,
    circuitIds: number[],
    models: ModelsManagerInterface
) {
    triggerProgress(step++ / steps, "Removing circuits...")
    for (const circuitId of circuitIds) {
        try {
            triggerProgress(step++ / steps, `Removing circuit #${circuitId}`)
            await models.circuit.remove(circuitId)
        } catch (ex) {
            // Ignore remove error, but log it in the console.
            console.error(ex)
        }
    }
    return step
}
