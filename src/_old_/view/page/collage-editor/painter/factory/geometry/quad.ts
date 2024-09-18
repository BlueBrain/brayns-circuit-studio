import { BufferAttribute, BufferGeometry } from "three"

export function makeQuadForLinesGeometry(): BufferGeometry {
    const A = 0.5
    const B = A / 4
    const geometry = new BufferGeometry()
    geometry.setAttribute(
        "position",
        new BufferAttribute(
            // prettier-ignore
            new Float32Array([
                -A + 2*B, +A,     0,
                +A,       +A,     0,
                +A,       -A,     0,
                -A,       -A,     0,
                -A,       +A + B, 0,
                -A + 2*B, +A + B, 0,
            ]),
            3
        )
    )
    return geometry
}
