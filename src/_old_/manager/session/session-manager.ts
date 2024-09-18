import SessionManagerInterface from "@/_old_/contract/manager/session"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import { CircuitInterface, MeshInterface } from "@/_old_/contract/type/model"
import { ProgressHandler } from "@/_old_/contract/type/progress"
import SerializableData from "@/_old_/contract/type/serializable-data"

const MODEL_CIRCUITS = "modelCircuits"
const MODEL_MESHES = "modelMeshes"

export default class SessionManager implements SessionManagerInterface {
    constructor(private readonly service: SessionStorageServiceInterface) {}

    public get modelCircuits(): CircuitInterface[] {
        return this._modelCircuits
    }

    public set modelCircuits(circuits: CircuitInterface[]) {
        this._modelCircuits = circuits
        void this.save(MODEL_CIRCUITS, circuits as unknown as SerializableData)
    }

    public get modelMeshes(): MeshInterface[] {
        return this._modelMeshes
    }

    public set modelMeshes(meshes: CircuitInterface[]) {
        this._modelMeshes = meshes
        void this.save(MODEL_MESHES, meshes as unknown as SerializableData)
    }

    async initialize(onProgress: ProgressHandler): Promise<void> {
        onProgress({ value: 1, label: "Loading circuits, meshes, slices, ..." })
        this._modelCircuits = await this.load(MODEL_CIRCUITS, [])
        this._modelMeshes = await this.load(MODEL_MESHES, [])
    }

    private async load<T extends SerializableData>(
        name: string,
        defaultValue: T
    ): Promise<T> {
        const data = await this.service.load(name, defaultValue)
        return data as T
    }

    private async save(name: string, data: SerializableData) {
        await this.service.save(name, data)
    }

    private _modelCircuits: CircuitInterface[] = []

    private _modelMeshes: MeshInterface[] = []
}
