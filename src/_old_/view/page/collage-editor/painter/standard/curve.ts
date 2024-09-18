import { NOT_FOUND } from "@/_old_/constants"
import { Slices } from "@/_old_/contract/feature/morphology-collage"
import {
    BoxGeometry as ThreeBoxGeometry,
    Group as ThreeGroup,
    Mesh as ThreeMesh,
    MeshPhongMaterial as ThreeMeshPhongMaterial,
    Quaternion as ThreeQuaternion,
} from "three"

const SLICE_GEOMETRY = new ThreeBoxGeometry(1, 1, 1)
const SLICE_MATERIALS: ThreeMeshPhongMaterial[] = [
    makeMaterial(0x00ff00),
    makeMaterial(0xffff00),
    makeMaterial(0xff0000),
]

export default class Curve {
    public readonly group = new ThreeGroup()
    private previousCount = NOT_FOUND

    updateScene(slices: Slices) {
        /** Create geometries if the number of slices has changed since last call. */
        this.resetGroup(slices)
        const { group } = this
        const count = slices.positions.length
        for (let index = 0; index < count; index++) {
            const mesh = group.children[index] as ThreeMesh
            const { center, orientation } = slices.positions[index]
            mesh.position.set(...center)
            mesh.scale.set(slices.width, slices.height, slices.depth)
            mesh.rotation.setFromQuaternion(new ThreeQuaternion(...orientation))
        }
    }

    /**
     * Create the boxes that will represent the slices.
     * The size and position will be set in another function.
     */
    private resetGroup(slices: Slices) {
        const { group } = this
        const count = slices.positions.length
        // Meshes are recreated only if their number has changed.
        if (count === this.previousCount) return

        this.previousCount = count
        group.clear()
        if (count < 1) return

        for (let index = 0; index < count; index++) {
            group.add(
                new ThreeMesh(
                    SLICE_GEOMETRY,
                    SLICE_MATERIALS[index % SLICE_MATERIALS.length]
                )
            )
        }
    }
}

function makeMaterial(color: number): ThreeMeshPhongMaterial {
    return new ThreeMeshPhongMaterial({
        color,
    })
}
