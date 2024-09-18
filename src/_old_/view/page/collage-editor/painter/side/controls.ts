import CalcInterface from "@/_old_/contract/tool/calc"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import { double } from "@/_old_/constants"
import { makeDotMaterial } from "../factory/material/dot"
import { makeQuadForLinesGeometry } from "../factory/geometry/quad"
import {
    SlicesBezierCurveControlPoint,
    SlicesBezierCurve,
} from "@/_old_/contract/feature/morphology-collage"
import {
    BoxGeometry,
    DoubleSide,
    Group,
    LineBasicMaterial,
    LineLoop,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Quaternion as ThreeQuaternion,
    SphereGeometry,
} from "three"

const SLICE_GEOMETRY = new PlaneGeometry(1, 1)
const QUAD_GEOMETRY = makeQuadForLinesGeometry()
const STICK_GEOMETRY = new BoxGeometry(1, 1, 1)
const TIP_GEOMETRY = new SphereGeometry(1, 8, 8)
const HANDLE_MATERIAL_A = new MeshPhongMaterial({
    color: 0x00ff00,
    shininess: 100,
})
const HANDLE_MATERIAL_B = new MeshPhongMaterial({
    color: 0xff0000,
    shininess: 100,
})

export default class Controls {
    public readonly group = new Group()
    private readonly sliceMeshA = new Mesh(
        SLICE_GEOMETRY,
        makeDotMaterial(0x00ff00)
    )
    private readonly sliceLineA = new LineLoop(
        QUAD_GEOMETRY,
        new LineBasicMaterial({
            side: DoubleSide,
            color: 0x00ff00,
            linewidth: 2,
        })
    )
    private readonly sliceMeshB = new Mesh(
        SLICE_GEOMETRY,
        makeDotMaterial(0xff0000)
    )
    private readonly sliceLineB = new LineLoop(
        QUAD_GEOMETRY,
        new LineBasicMaterial({
            side: DoubleSide,
            color: 0xff0000,
        })
    )
    private readonly stickMeshA = new Mesh(STICK_GEOMETRY, HANDLE_MATERIAL_A)
    private readonly stickMeshB = new Mesh(STICK_GEOMETRY, HANDLE_MATERIAL_B)
    private readonly tipMeshA = new Mesh(TIP_GEOMETRY, HANDLE_MATERIAL_A)
    private readonly tipMeshB = new Mesh(TIP_GEOMETRY, HANDLE_MATERIAL_B)

    constructor(
        private readonly calc: CalcInterface,
        private readonly cameraManager: CameraModuleInterface
    ) {
        this.group.add(this.sliceMeshA, this.sliceMeshB)
        this.group.add(this.sliceLineA, this.sliceLineB)
        this.group.add(this.tipMeshA, this.tipMeshB)
        this.group.add(this.stickMeshA, this.stickMeshB)
    }

    updateScene(slicesDef: SlicesBezierCurve) {
        const { pointStart, pointEnd } = slicesDef
        this.updateSlice(
            slicesDef,
            this.sliceMeshA,
            this.sliceLineA,
            pointStart
        )
        this.updateSlice(slicesDef, this.sliceMeshB, this.sliceLineB, pointEnd)
        this.updateHandles(slicesDef)
    }

    private updateSlice(
        slicesDef: SlicesBezierCurve,
        mesh: Mesh,
        line: LineLoop,
        point: SlicesBezierCurveControlPoint
    ) {
        if (!point) return

        mesh.position.set(...point.center)
        line.position.set(...point.center)
        mesh.rotation.setFromQuaternion(
            new ThreeQuaternion(...point.orientation)
        )
        line.rotation.setFromQuaternion(
            new ThreeQuaternion(...point.orientation)
        )
        const { width, height } = slicesDef
        mesh.scale.set(width, height, 1)
        line.scale.set(width, height, 1)
    }

    private updateHandles(slicesDef: SlicesBezierCurve) {
        this.updateHandle(this.stickMeshA, this.tipMeshA, slicesDef.pointStart)
        this.updateHandle(this.stickMeshB, this.tipMeshB, slicesDef.pointEnd)
    }

    private updateHandle(
        stickMesh: Mesh,
        tipMesh: Mesh,
        point: SlicesBezierCurveControlPoint
    ) {
        const { calc } = this
        const r = this.cameraManager.getHeightAtTarget() / 100
        const r2 = double(r)
        const axis = calc.getAxisFromQuaternion(point.orientation)
        const tipCenter = calc.addVectors(
            point.center,
            calc.scaleVector(
                axis.z,
                point.type === "start"
                    ? -point.handleLength
                    : +point.handleLength
            )
        )
        const stickCenter = calc.interpolateVectors(
            point.center,
            tipCenter,
            0.5
        )
        tipMesh.position.set(...tipCenter)
        tipMesh.scale.set(r2, r2, r2)
        stickMesh.position.set(...stickCenter)
        stickMesh.scale.set(r, r, point.handleLength)
        stickMesh.rotation.setFromQuaternion(
            new ThreeQuaternion(...point.orientation)
        )
    }
}
