import { CellPlacementListInterface } from "./types/cell-placement-list"
import { CircuitListInterface } from "./types/circuit-list"
import { MeshListInterface } from "./types/mesh-list"
import { MorphologyListInterface } from "./types/morphology-list"
import { VolumeListInterface } from "./types/volume-list"

/**
 * Manage the list of all models loaded in the current scene.
 */
export default interface ModelsManagerInterface {
    readonly cellPlacement: CellPlacementListInterface
    readonly circuit: CircuitListInterface
    readonly mesh: MeshListInterface
    readonly morphology: MorphologyListInterface
    readonly volume: VolumeListInterface
}
