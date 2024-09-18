import CalcInterface, { Vector3 } from "@/_old_/contract/tool/calc"
import Color from "@/_old_/ui/color"
import { makeDotMaterial } from "../factory/material/dot"
import { NOT_FOUND } from "@/_old_/constants"
import {
    Group,
    Mesh,
    PlaneGeometry,
    Quaternion as ThreeQuaternion,
} from "three"
import {
    SlicesBezierCurveControlPoint,
    SlicesBezierCurve,
} from "@/_old_/contract/feature/morphology-collage"

const SLICE_GEOMETRY = new PlaneGeometry(1, 1)

export default class Curve {
    public readonly group = new Group()
    private previousCount = NOT_FOUND

    constructor(private readonly calc: CalcInterface) {}

    updateScene(slicesDef: SlicesBezierCurve) {
        this.resetGroup(slicesDef)
        const { calc, group } = this
        const { pointStart, pointEnd, slicesCount } = slicesDef
        const tipStart: Vector3 = findTip(calc, pointStart)
        const tipEnd: Vector3 = findTip(calc, pointEnd)
        for (let index = 1; index < slicesCount - 1; index++) {
            const alpha = index / slicesCount
            const center = calc.bezierCubic(
                pointStart.center,
                tipStart,
                tipEnd,
                pointEnd.center,
                alpha
            )
            const mesh = group.children[index - 1]
            mesh.position.set(...center)
            mesh.scale.set(slicesDef.width, slicesDef.height, 1)
            mesh.rotation.setFromQuaternion(
                new ThreeQuaternion(
                    ...calc.slerp(
                        pointStart.orientation,
                        pointEnd.orientation,
                        alpha
                    )
                )
            )
        }
    }

    private resetGroup(slicesDef: SlicesBezierCurve) {
        const { group } = this
        const count = slicesDef.slicesCount
        // Meshes are recreated only if their number has changed.
        if (count === this.previousCount) return

        this.previousCount = count
        group.clear()
        if (count < 3) return

        const colors = Color.interpolate(["#0f0", "#ff0", "#f00"], count)
        for (let index = 1; index < count - 1; index++) {
            const [red, green, blue] = colors[index].toArrayRGB()
            const color =
                (Math.floor(red * 255) << 16) +
                (Math.floor(green * 255) << 8) +
                Math.floor(blue * 255)
            group.add(new Mesh(SLICE_GEOMETRY, makeDotMaterial(color)))
        }
    }
}

function findTip(
    calc: CalcInterface,
    point: SlicesBezierCurveControlPoint
): Vector3 {
    const axis = calc.getAxisFromQuaternion(point.orientation)
    return calc.addVectors(
        point.center,
        calc.scaleVector(
            axis.z,
            point.type === "start" ? -point.handleLength : +point.handleLength
        )
    )
}
