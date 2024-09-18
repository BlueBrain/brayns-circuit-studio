import { ColorRGBA } from "@/_old_/contract/manager/circuit-colors"

export interface OptionalColor {
    enabled: boolean
    color: ColorRGBA
}

export interface Colors {
    [layerName: string]: OptionalColor
}
