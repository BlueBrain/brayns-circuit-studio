import CalcInterface from "@/_old_/contract/tool/calc"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import Controls from "./controls"
import Curve from "./curve"
import { makeLight } from "../factory/light"
import { Scene } from "three"
import { SlicesBezierCurve } from "@/_old_/contract/feature/morphology-collage"

/**
 * Build a ThreeJS scene from a BezierSlicesDefinition object.
 */
export default class SceneProvider {
    private readonly controls: Controls
    private readonly curve: Curve
    private previousSlicesDef: SlicesBezierCurve | null = null
    public readonly scene: Scene = new Scene()

    constructor(calc: CalcInterface, cameraManager: CameraModuleInterface) {
        this.controls = new Controls(calc, cameraManager)
        this.curve = new Curve(calc)
        this.scene.add(makeLight(), this.controls.group, this.curve.group)
    }

    updateScene(slicesDef: SlicesBezierCurve) {
        if (slicesDef === this.previousSlicesDef) return

        this.previousSlicesDef = slicesDef
        this.controls.updateScene(slicesDef)
        this.curve.updateScene(slicesDef)
    }
}
