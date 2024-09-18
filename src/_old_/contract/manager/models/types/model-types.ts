import { DEFAULT_COLOR } from "@/_old_/constants"
import { Vector3, Vector4 } from "@/_old_/contract/tool/calc"
import { isVector4 } from "@/_old_/tool/validator"

export interface ModelColor {
    method: string
    values: unknown
}

export interface Model {
    type: string
    /** Unique ID known only by BCS. */
    id: number
    /** The full filename from which this model comes. */
    path: string
    /**
     * Content of the model we want to load.
     * If this attribute is defined, we don't load from `path`,
     * but still use it to know the file extension.
     * */
    data?: string | ArrayBuffer
    loader: {
        /** Loader name: "BBP loader", "mesh", ... */
        name: string
        /** Loader properties. */
        data: unknown
    }
    /** Defaults to the last part of `path`. */
    name: string
    /** Corresponding model ids in Brayns. */
    modelIds: number[]
    /**
     * Can be "cells", "afferent synapses", ...
     */
    modelTypes: string[]
    /** Is this model actually visible in the scene? */
    visible: boolean
    /** Colors of the model. */
    colors: ModelColor
    /**
     * The camera will orbit around this point.
     * By default it is the center of the bounding box.
     */
    cameraTarget: Vector3
    /** The smallest axis-aligned rectangular box in which the models fit. */
    boundingBox: {
        min: Vector3
        max: Vector3
    }
}

export function extractSolidColor(
    colors: ModelColor,
    defaultValue?: Vector4
): Vector4 {
    const { method, values } = colors
    if (method === "solid" && isVector4(values)) {
        return values
    }
    return defaultValue ?? DEFAULT_COLOR
}
