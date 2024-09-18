import { Model } from "./model-types"
import { isObject } from "@/_old_/tool/validator"
import { isModel } from "./model-guards"

export interface MorphologyModel extends Model {
    type: "morphology"
}

export function isMorphologyModel(data: unknown): data is MorphologyModel {
    if (!isObject(data)) return false
    if (data.type !== "morphology") return false
    const { colors } = data
    return isObject(colors) && isModel(data)
}
