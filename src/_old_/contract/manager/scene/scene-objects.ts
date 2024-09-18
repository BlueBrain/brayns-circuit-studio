import { SceneObjectsAxisManagerInterface } from "./scene-objects-axis"
import { SceneObjectsBoxesManagerInterface } from "./scene-objects-boxes"
import { SceneObjectsPlanesManagerInterface } from "./scene-objects-planes"

export interface SceneObjectsManagerInterface {
    readonly planes: SceneObjectsPlanesManagerInterface
    readonly axis: SceneObjectsAxisManagerInterface
    readonly boxes: SceneObjectsBoxesManagerInterface

    /**
     * Remove all the objects from the current scene.
     */
    clear(): Promise<void>
}
