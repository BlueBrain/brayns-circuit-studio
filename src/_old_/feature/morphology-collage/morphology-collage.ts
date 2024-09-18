import CalcInterface, { Vector3 } from "@/_old_/contract/tool/calc"
import StorageInterface from "@/_old_/contract/storage"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import MorphologyCollageFeatureInterface, {
    SlicesBezierCurveControlPoint,
    SlicesBezierCurve,
    Slices,
    Collage,
    isCollage,
} from "@/_old_/contract/feature/morphology-collage"

interface CurvePoint {
    center: Vector3
    /** Distance from the curve's first point. */
    distance: number
}

export default class MorphologyCollageFeature extends MorphologyCollageFeatureInterface {
    public readonly table: TableStorageInterface<Collage>

    constructor(
        private readonly calc: CalcInterface,
        storage: StorageInterface
    ) {
        super()
        this.table = storage.makeTable(
            "morphology-collage/slices",
            inflexibleConverter(isCollage)
        )
    }

    computeSlicesFromBezierCurve(bezier: SlicesBezierCurve): Slices {
        const slices: Slices = {
            width: bezier.width,
            height: bezier.height,
            depth: 0,
            positions: [],
        }
        const curve: CurvePoint[] = computeCurve(bezier, this.calc)
        const curveLength = curve[curve.length - 1].distance
        slices.depth = computeAverageDepth(curve) * bezier.depthScale
        for (const point of curve) {
            const alpha = point.distance / curveLength
            slices.positions.push({
                center: point.center,
                orientation: this.calc.slerp(
                    bezier.pointStart.orientation,
                    bezier.pointEnd.orientation,
                    alpha
                ),
            })
        }
        return slices
    }
}

function computeCurve(
    bezier: SlicesBezierCurve,
    calc: CalcInterface
): CurvePoint[] {
    const curve: CurvePoint[] = []
    const firstPoint = bezier.pointStart.center
    const firstControl = findBackHandle(bezier.pointStart, calc)
    const lastPoint = bezier.pointEnd.center
    const lastControl = findFrontHandle(bezier.pointEnd, calc)
    let previousCenter: Vector3 | null = null
    let totalDistance = 0
    for (let index = 0; index < bezier.slicesCount; index++) {
        const alpha = index / (bezier.slicesCount + 1)
        const center = calc.bezierCubic(
            firstPoint,
            firstControl,
            lastControl,
            lastPoint,
            alpha
        )
        if (previousCenter) {
            totalDistance += calc.distance(center, previousCenter)
        }
        previousCenter = center
        curve.push({
            center: center,
            distance: totalDistance,
        })
    }
    return curve
}

function findFrontHandle(
    point: SlicesBezierCurveControlPoint,
    calc: CalcInterface
) {
    const axis = calc.getAxisFromQuaternion(point.orientation)
    return calc.addVectors(
        point.center,
        calc.scaleVector(axis.z, point.handleLength)
    )
}

function findBackHandle(
    point: SlicesBezierCurveControlPoint,
    calc: CalcInterface
) {
    const axis = calc.getAxisFromQuaternion(point.orientation)
    return calc.addVectors(
        point.center,
        calc.scaleVector(axis.z, -point.handleLength)
    )
}

/**
 * We compute the average depth of a slice as the maximal distance
 * between the centers of any adjacent slice.
 */
function computeAverageDepth(curve: CurvePoint[]) {
    let maxDistance = 0
    curve.forEach((point, index) => {
        if (index > 0)
            maxDistance = Math.max(
                maxDistance,
                point.distance - curve[index - 1].distance
            )
    })
    return maxDistance
}
