import {
    assertNumber,
    assertVector3,
    assertVector4,
    isObject,
    isNumber,
    isVector3,
} from "@/_old_/tool/validator"
import {
    SceneObjectsPlanesSet,
    SceneObjectsPlaneDefinition,
    SceneObjectsPlaneDefinition4,
    SceneObjectsPlaneDefinition6,
} from "@/_old_/contract/manager/scene/scene-objects-planes"
import { assertObject } from "@/_old_/tool/validator"

export function isSceneObjectsPlane(
    data: unknown
): data is SceneObjectsPlanesSet {
    try {
        assertObject(data)
        const { id, definition, color } = data
        assertNumber(id, "data.id")
        assertVector4(color, "data.color")
        assertSceneObjectsPlaneDefinition(definition, "data.definition")
        return true
    } catch (ex) {
        console.error("Invalid SceneObjectsPlane:", data)
        console.error(ex)
        return false
    }
}

export function isSceneObjectsPlaneDefinition4(
    data: unknown
): data is SceneObjectsPlaneDefinition4 {
    if (!isObject(data)) return false
    const { a, b, c, d } = data
    return isNumber(a) && isNumber(b) && isNumber(c) && isNumber(d)
}

export function isSceneObjectsPlaneDefinition6(
    data: unknown
): data is SceneObjectsPlaneDefinition4 {
    if (!isObject(data)) return false
    const { point, normal } = data
    return isVector3(point) && isVector3(normal)
}

function assertSceneObjectsPlaneDefinition(
    data: unknown,
    name: string
): asserts data is SceneObjectsPlaneDefinition {
    assertObject(data, name)
    if (typeof data.a === "number")
        assertSceneObjectsPlaneDefinition4(data, name)
    else assertSceneObjectsPlaneDefinition6(data, name)
}

function assertSceneObjectsPlaneDefinition4(
    data: unknown,
    name: string
): asserts data is SceneObjectsPlaneDefinition4 {
    assertObject(data, name)
    const { a, b, c, d } = data
    assertNumber(a, `${name}.a`)
    assertNumber(b, `${name}.b`)
    assertNumber(c, `${name}.c`)
    assertNumber(d, `${name}.d`)
}

function assertSceneObjectsPlaneDefinition6(
    data: unknown,
    name: string
): asserts data is SceneObjectsPlaneDefinition6 {
    assertObject(data, name)
    const { point, normal } = data
    assertVector3(point, `${name}.point`)
    assertVector3(normal, `${name}.normal`)
}
