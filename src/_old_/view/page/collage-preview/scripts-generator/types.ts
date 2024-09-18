import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api"
import FileSystemServiceInterface from "@/_old_/contract/service/file-system"
import SceneManagerInterface from "@/_old_/contract/manager/scene/scene-manager"
import { Slices } from "@/_old_/contract/feature/morphology-collage"

export interface GenerateScriptsForMorphologyCollageOptions {
    /** "proj3", "proj82", ... */
    account: string
    cellsPerSlice: number
    outputFolder: string
    resolution: [width: number, height: number]
    slices: Slices
}

export interface GenerateScriptsForMorphologyCollageServices {
    brayns: BraynsApiServiceInterface
    fileSystem: FileSystemServiceInterface
    scene: SceneManagerInterface
}
