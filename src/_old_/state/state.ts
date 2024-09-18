import AtomicState from "./atomic-state"
import { isNumber } from "../tool/validator"

export default Object.freeze({
    overlay: {
        meshes: {
            opacity: new AtomicState(0.5, {
                id: "overlay/meshes/opacity",
                guard: isNumber,
            }),
            brightness: new AtomicState(0.5, {
                id: "overlay/meshes/brightness",
                guard: isNumber,
            }),
            thickness: new AtomicState(0.5, {
                id: "overlay/meshes/thickness",
                guard: isNumber,
            }),
        },
    },
})
