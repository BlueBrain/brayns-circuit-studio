import { ColorRGBA } from "@/_old_/contract/manager/circuit-colors"
import { Colors } from "./types"

/**
 * @param names Set of available names.
 * @returns All enabled colors whose names are in `names`.
 */
export function getEnabledColors(colors: Colors, names: string[]) {
    const colorByLayers: { [layer: string]: ColorRGBA } = {}
    for (const key of Object.keys(colors)) {
        if (names.includes(key)) {
            colorByLayers[key] = colors[key].color
        }
    }
    return colorByLayers
}
