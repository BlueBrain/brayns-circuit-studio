import Curve from "./curve"
import { makeLight } from "../factory/light"
import { Scene } from "three"
import { Slices } from "@/_old_/contract/feature/morphology-collage"

export default class SceneProvider {
    private readonly curve: Curve
    public readonly scene: Scene = new Scene()

    constructor() {
        this.curve = new Curve()
        this.scene.add(makeLight(), this.curve.group)
    }

    updateScene(slices: Slices) {
        this.curve.updateScene(slices)
    }
}
