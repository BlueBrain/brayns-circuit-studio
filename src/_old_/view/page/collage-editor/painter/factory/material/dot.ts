import Frag from "./dot.frag"
import Vert from "./dot.vert"
import { Color, ColorRepresentation, DoubleSide, ShaderMaterial } from "three"

export function makeDotMaterial(color: ColorRepresentation): ShaderMaterial {
    return new ShaderMaterial({
        uniforms: {
            color: { value: new Color(color) },
        },
        vertexShader: Vert,
        fragmentShader: Frag,
        side: DoubleSide,
    })
}
