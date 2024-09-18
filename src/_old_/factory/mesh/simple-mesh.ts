import CalcInterface, { Vector3 } from "@/_old_/contract/tool/calc"

const EPSILON = 1e-6

export default class SimpleMesh {
    private readonly vertices: Vector3[] = []
    private readonly normals: Vector3[] = []
    private readonly triangles: Array<
        [indexVertex1: number, indexVertex2: number, indexVertex3: number]
    > = []
    private readonly normalsPerTriangles: Array<
        [indexVertex1: number, indexVertex2: number, indexVertex3: number]
    > = []

    constructor(private readonly calc: CalcInterface) {}

    addTri(point1: Vector3, point2: Vector3, point3: Vector3) {
        const [idx1, idx2, idx3] = [point1, point2, point3].map(
            this.getVertexIndex
        )
        this.triangles.push([idx1, idx2, idx3])
    }

    /**
     * Given three points A, B and C, we deduce point D by forcing
     * * AB to be parallel to CD
     * * BC to be parallel to AD
     */
    addQuad(
        point1: Vector3,
        point2: Vector3,
        point3: Vector3,
        point4?: Vector3
    ) {
        const [x1, y1, z1] = point1
        const [x2, y2, z2] = point2
        const [x3, y3, z3] = point3
        const lastPoint: Vector3 = point4 ?? [
            x3 + x1 - x2,
            y3 + y1 - y2,
            z3 + z1 - z2,
        ]
        this.addTri(point1, point2, point3)
        this.addTri(point1, point3, lastPoint)
    }

    /**
     * @returns Code in OBJ format.
     */
    toOBJ(name = "Mesh"): string {
        this.computeNormalsForFlatShading()
        return `o ${name}
${this.vertices
    .map(([x, y, z]) => `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}`)
    .join("\n")}
${this.normals
    .map(([x, y, z]) => `vn ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}`)
    .join("\n")}
s off
${this.triangles
    .map(([v1, v2, v3], index) => {
        const [n1, n2, n3] = this.normalsPerTriangles[index]
        return `f ${v1 + 1}//${n1 + 1} ${v2 + 1}//${n2 + 1} ${v3 + 1}//${
            n3 + 1
        }`
    })
    .join("\n")}
`
    }

    private computeNormalsForFlatShading() {
        this.triangles.forEach(([idx1, idx2, idx3]) => {
            const point1 = this.vertices[idx1]
            const point2 = this.vertices[idx2]
            const point3 = this.vertices[idx3]
            const calc = this.calc
            const v1 = calc.normalizeVector(calc.subVectors(point3, point2))
            const v2 = calc.normalizeVector(calc.subVectors(point1, point2))
            const normalVector = calc.crossProduct(v1, v2)
            const normalIndex = this.getNormalIndex(normalVector)
            this.normalsPerTriangles.push([
                normalIndex,
                normalIndex,
                normalIndex,
            ])
        })
    }

    private readonly getVertexIndex = ([x, y, z]: Vector3): number => {
        return getElementIndex(this.vertices, x, y, z)
    }

    private readonly getNormalIndex = ([x, y, z]: Vector3): number => {
        return getElementIndex(this.normals, x, y, z)
    }
}

function areClose(a: number, b: number): boolean {
    return Math.abs(a - b) < EPSILON
}

function getElementIndex(
    array: Vector3[],
    x: number,
    y: number,
    z: number
): number {
    for (let index = 0; index < array.length; index++) {
        const [xx, yy, zz] = array[index]
        if (areClose(x, xx) && areClose(y, yy) && areClose(z, zz)) return index
    }
    array.push([x, y, z])
    return array.length - 1
}
