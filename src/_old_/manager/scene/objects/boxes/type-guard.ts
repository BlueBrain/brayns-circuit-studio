import { SceneObjectsBox } from "@/_old_/contract/manager/scene/scene-objects-boxes"
import {
    assertObject,
    assertNumber,
    assertVector3,
    assertVector4,
} from "@/_old_/tool/validator"

export function isSceneObjectsBox(data: unknown): data is SceneObjectsBox {
    try {
        assertObject(data)
        const { id, center, width, height, depth, color, orientation } = data
        const prefix = "data"
        assertNumber(id, `${prefix}.id`)
        assertNumber(width, `${prefix}.width`)
        assertNumber(height, `${prefix}.height`)
        assertNumber(depth, `${prefix}.depth`)
        assertVector3(center, `${prefix}.center`)
        assertVector4(color, `${prefix}.color`)
        assertVector4(orientation, `${prefix}.orientation`)
        return true
    } catch (ex) {
        console.error("Invalid SceneObjectsBox:", data)
        console.error(ex)
        return false
    }
}
