import { Model } from "./model-types"
import { isObject } from "@/_old_/tool/validator"
import { isModel } from "./model-guards"

export interface MeshModel extends Model {
    type: "mesh"
}

export function isMeshModel(data: unknown): data is MeshModel {
    if (!isObject(data)) return false
    if (data.type !== "mesh") return false
    const { colors } = data
    return isObject(colors) && isModel(data)
}
