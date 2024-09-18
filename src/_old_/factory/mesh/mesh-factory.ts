import MeshFactoryInterface, {
    SlicerMeshParams,
} from "@/_old_/contract/factory/mesh"
import SimpleMesh from "./simple-mesh"
import { half } from "@/_old_/constants"
import CalcInterface from "../../contract/tool/calc"

export default class MeshFactory implements MeshFactoryInterface {
    constructor(private readonly calc: CalcInterface) {}

    // eslint-disable-next-line class-methods-use-this
    makeSlicer(params: Partial<SlicerMeshParams> = {}): string {
        const EPSILON = 1e-3
        const mesh = new SimpleMesh(this.calc)
        const { width, height, depth } = {
            width: 1,
            height: 1,
            depth: 1,
            ...params,
        }
        const x = half(width)
        const y = half(height)
        // We remove epsilon in Z to prevent the mesh from being cut by clipping planes.
        const z = half(depth) - EPSILON
        const nutch = half(half(x))
        // Frame
        mesh.addQuad([x, y, z], [x, y, -z], [-x, y, -z]) // Top
        mesh.addQuad([x, y, z], [x, -y, z], [x, -y, -z]) // Right
        mesh.addQuad([x, -y, z], [-x, -y, z], [-x, -y, -z]) // Bottom
        mesh.addQuad([-x, y, z], [-x, y, -z], [-x, -y, -z]) // Left
        // Nutch
        mesh.addTri(
            [-x, y, z],
            [-x + nutch, y + nutch, 0],
            [-x + nutch + nutch, y, z]
        )
        // Border
        const border = half(nutch)
        mesh.addQuad(
            [x, y, -z],
            [-x, y, -z],
            [-x - border, y + border, -z],
            [x + border, y + border, -z]
        ) // Top
        mesh.addQuad(
            [x, -y, -z],
            [-x, -y, -z],
            [-x - border, -y - border, -z],
            [x + border, -y - border, -z]
        ) // Bottom
        mesh.addQuad(
            [x, y, -z],
            [x, -y, -z],
            [x + border, -y - border, -z],
            [x + border, y + border, -z]
        ) // Right
        mesh.addQuad(
            [-x, y, -z],
            [-x, -y, -z],
            [-x - border, -y - border, -z],
            [-x - border, y + border, -z]
        ) // Left
        return mesh.toOBJ("Slice")
    }
}
