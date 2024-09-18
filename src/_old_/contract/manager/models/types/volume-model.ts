import { Model } from "./model-types"
import { isObject } from "@/_old_/tool/validator"
import { isModel } from "./model-guards"

export interface VolumeModel extends Model {
    type: "volume"
    /**
     * How the data is formated inside of the NRRD file.
     */
    format: "scalar" | "orientation" | "flatmap"
    availableUseCases: string[]
    useCase: string
}

export function isVolumeModel(data: unknown): data is VolumeModel {
    if (!isObject(data)) return false
    if (data.type !== "volume") return false
    const { colors } = data
    return isObject(colors) && isModel(data)
}
