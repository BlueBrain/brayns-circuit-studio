import { Quaternion, Vector3 } from "@/_old_/contract/tool/calc"

/**
 * Plane is defined by a point and a normal.
 */
export interface SceneObjectsAxis {
    center: Vector3
    orientation: Quaternion
    length: number
    thickness: number
}

export interface SceneObjectsAxisSet {
    /** Model ID. */
    id: number
    axis: SceneObjectsAxis[]
}

/**
 * Manage sets of planes.
 */
export interface SceneObjectsAxisManagerInterface {
    /**
     * Create one or many planes according to their definitions and colors.
     * @returns On model's ID that owns all the planes.
     */
    add(...axisList: SceneObjectsAxis[]): Promise<number>

    /**
     * @returns The plane with the given id, or `null` if not found.
     */
    get(id: number): Promise<undefined | SceneObjectsAxisSet>

    /**
     * @returns An array of all the planes in the current scene.
     */
    all(): Promise<SceneObjectsAxisSet[]>

    /**
     * Remove all the planes sets for the given ids.
     */
    remove(...ids: number[]): Promise<void>

    /**
     * Remove all the planes sets in the current scene.
     */
    clear(): Promise<void>
}
