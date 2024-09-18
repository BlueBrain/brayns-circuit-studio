import { Model } from "./model-types"
import {
    assertBoolean,
    assertNumber,
    assertNumberArray,
    assertObject,
    assertString,
    assertStringArray,
    assertVector3,
} from "@/_old_/tool/validator"

export function isModel(data: unknown): data is Model {
    try {
        assertModel(data)
        return true
    } catch (ex) {
        return false
    }
}

export function assertModel(
    data: unknown,
    name = "data"
): asserts data is Model {
    assertObject(data, name)
    assertNumber(data.id, `${name}.id`)
    assertString(data.path, `${name}.path`)
    assertString(data.name, `${name}.name`)
    assertNumberArray(data.modelIds, `${name}.modelIds`)
    assertStringArray(data.modelTypes, `${name}.modelTypes`)
    assertBoolean(data.visible, `${name}.visible`)
    assertVector3(data.cameraTarget, `${name}.cameraTarget`)
    assertObject(data.boundingBox, `${name}.boundingBox`)
    assertVector3(data.boundingBox.min, `${name}.boundingBox.min`)
    assertVector3(data.boundingBox.max, `${name}.boundingBox.max`)
}
