import { Quaternion, Vector3, Vector4 } from "@/_old_/contract/tool/calc"

export interface SceneObjectsBox extends SceneObjectsBoxDefinition {
    /** Model ID. */
    id: number
}

export interface SceneObjectsBoxDefinition {
    center: Vector3
    orientation: Quaternion
    width: number
    height: number
    depth: number
    color: Vector4
}

/**
 * Manage sets of planes.
 */
export interface SceneObjectsBoxesManagerInterface {
    /**
     * Create one or many planes according to their definitions and colors.
     * @returns On model's ID that owns all the planes.
     */
    add(box: SceneObjectsBoxDefinition): Promise<number>

    /**
     * @returns The plane with the given id, or `null` if not found.
     */
    get(id: number): Promise<undefined | SceneObjectsBox>

    /**
     * @returns An array of all the planes in the current scene.
     */
    all(): Promise<SceneObjectsBox[]>

    /**
     * Remove all the planes sets for the given ids.
     */
    remove(...ids: number[]): Promise<void>

    /**
     * Remove all the planes sets in the current scene.
     */
    clear(): Promise<void>
}
