export interface SlicerMeshParams {
    width: number
    height: number
    depth: number
}

/**
 * Generate OBJ code for parametrized meshes.
 */
export default interface MeshFactoryInterface {
    /**
     * @returns The OBJ code for a mesh representing a slice.
     */
    makeSlicer(this: void, params?: Partial<SlicerMeshParams>): string
}
