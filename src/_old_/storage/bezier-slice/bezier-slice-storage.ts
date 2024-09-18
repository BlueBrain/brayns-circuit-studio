import TableStorage from "../table"
import UserStorageServiceInterface from "@/_old_/contract/service/storage/user-storage"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import {
    assertNumber,
    assertObject,
    assertVector3,
    assertVector4,
} from "@/_old_/tool/validator"
import {
    SlicesBezierCurveControlPoint,
    SlicesBezierCurve,
    BezierSlicesContainer,
} from "@/_old_/contract/feature/morphology-collage"

const TABLE_NAME = "bezier-slices"

export default class BezierSlicesStorage extends TableStorage<BezierSlicesContainer> {
    constructor(persistence: UserStorageServiceInterface) {
        super(
            persistence,
            TABLE_NAME,
            inflexibleConverter(isBezierSlicesContainer)
        )
    }
}

function isBezierSlicesContainer(data: unknown): data is BezierSlicesContainer {
    try {
        assertObject(data)
        const { id, bezier } = data
        assertNumber(id, "data.id")
        assertBezierSlicesDefinition(bezier, "data.bezier")
        return true
    } catch (ex) {
        console.error("Invalid BezierSlicesContainer:", data)
        console.error(ex)
        return false
    }
}

function assertBezierSlicesDefinition(
    data: unknown,
    name: string
): data is SlicesBezierCurve {
    assertObject(data, `${name}`)
    const { slicesCount, width, height, depthScale, pointStart, pointEnd } =
        data
    assertNumber(slicesCount, `${name}.slicesCount`)
    assertNumber(width, `${name}.width`)
    assertNumber(height, `${name}.height`)
    assertNumber(depthScale, `${name}.depthScale`)
    assertBezierSliceControlPoint(pointStart, `${name}.pointStart`)
    assertBezierSliceControlPoint(pointEnd, `${name}.pointEnd`)
    return true
}

function assertBezierSliceControlPoint(
    data: unknown,
    name: string
): asserts data is SlicesBezierCurveControlPoint {
    assertObject(data, name)
    const { center, orientation, handleLength } = data
    assertVector3(center, `${name}.center`)
    assertVector4(orientation, `${name}.orientation`)
    assertNumber(handleLength, `${name}.handleLength`)
}
