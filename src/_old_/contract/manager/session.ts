import {} from "@/_old_/contract/type/model"
import { ProgressHandler } from "../type/progress"
import { CircuitInterface, MeshInterface } from "../type/model"

export default interface SessionManagerInterface {
    modelCircuits: CircuitInterface[]

    modelMeshes: MeshInterface[]

    /**
     * Load all session variables in local cache.
     * This way, we can access session variables in a synchronous way
     * and have the actual persistence done in background.
     */
    initialize(onProgress: ProgressHandler): Promise<void>
}
