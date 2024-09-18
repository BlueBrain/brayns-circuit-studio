import { Vector3, Vector4 } from "@/_old_/contract/tool/calc"

export type SceneObjectsPlaneDefinition =
    | SceneObjectsPlaneDefinition4
    | SceneObjectsPlaneDefinition6

/**
 * Plane is defined by the equation `ax + by + cz + d = 0`.
 */
export interface SceneObjectsPlaneDefinition4 {
    a: number
    b: number
    c: number
    d: number
}

export interface SceneObjectsPlanesSet {
    /** Model ID. */
    id: number
    planes: SceneObjectsPlane[]
}

export interface SceneObjectsPlane {
    definition: SceneObjectsPlaneDefinition
    color: Vector4
}

/**
 * Plane is defined by a point and a normal.
 */
export interface SceneObjectsPlaneDefinition6 {
    point: Vector3
    normal: Vector3
}

/**
 * Manage sets of planes.
 */
export interface SceneObjectsPlanesManagerInterface {
    /**
     * Create one or many planes according to their definitions and colors.
     * @returns On model's ID that owns all the planes.
     */
    add(...planes: SceneObjectsPlane[]): Promise<number>

    /**
     * @returns The plane with the given id, or `null` if not found.
     */
    get(id: number): Promise<undefined | SceneObjectsPlanesSet>

    /**
     * @returns An array of all the planes in the current scene.
     */
    all(): Promise<SceneObjectsPlanesSet[]>

    /**
     * Remove all the planes sets for the given ids.
     */
    remove(...ids: number[]): Promise<void>

    /**
     * Remove all the planes sets in the current scene.
     */
    clear(): Promise<void>
}
