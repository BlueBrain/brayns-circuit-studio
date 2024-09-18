import {
    assertNumber,
    assertVector3,
    assertVector4,
    assertArray,
} from "@/_old_/tool/validator"
import { assertObject } from "@/_old_/tool/validator"
import {
    SceneObjectsAxisSet,
    SceneObjectsAxis,
} from "@/_old_/contract/manager/scene/scene-objects-axis"

export function isSceneObjectsAxisSet(
    data: unknown
): data is SceneObjectsAxisSet {
    try {
        assertObject(data)
        const { id, axis } = data
        assertNumber(id, "data.id")
        assertSceneObjectsAxisArray(axis, "data.axis")
        return true
    } catch (ex) {
        console.error("Invalid SceneObjectsAxisSet:", data)
        console.error(ex)
        return false
    }
}

function assertSceneObjectsAxisArray(
    data: unknown,
    name: string
): asserts data is SceneObjectsAxis[] {
    assertArray(data, name)
    for (let i = 0; i < data.length; i++) {
        const elem = data[i]
        assertSceneObjectsAxis(elem, `${name}[${i}]`)
    }
}

function assertSceneObjectsAxis(
    data: unknown,
    name: string
): asserts data is SceneObjectsAxis {
    assertObject(data, name)
    const { center, orientation, length, thickness } = data
    assertVector3(center, `${name}.center`)
    assertVector4(orientation, `${name}.orientation`)
    assertNumber(length, `${name}.length`)
    assertNumber(thickness, `${name}.thickness`)
}
