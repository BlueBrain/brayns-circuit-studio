import { Vector3 } from "@/_old_/contract/tool/calc"

export interface BraynsClippingPlane {
    id: number
    normal: Vector3
    distance: number
}

export default interface BraynsApiClippingPlanesInterface {
    /**
     * Create a clipping plane and return its id.
     */
    add(clippingPlane: Omit<BraynsClippingPlane, "id">): Promise<number>

    /**
     * Update existng clipping planes.
     */
    update(...clippingPlane: BraynsClippingPlane[]): Promise<void>

    remove(planeId: number): Promise<void>

    removeMany(planeIds: number[]): Promise<void>

    /**
     * Remove all existing clipping planes.
     */
    clear(): Promise<void>
}
