import { Colors } from "./types"

import Color from "@/_old_/ui/color"
import { useLocalStorageState } from "@/_old_/ui/hooks"

export function useOptionalColors(
    storageKey: string,
    names: string[]
): [colors: Colors, setColors: (colors: Colors) => void] {
    const [colors, setColors] = useLocalStorageState<Colors>(
        getDefaultColors(names),
        `view-circuitColorEditor-ColorByMTypeView/colors/${storageKey}`
    )
    return [colors, setColors]
}

function getDefaultColors(layers: string[]): Colors {
    const colors: Colors = {}
    if (layers.length === 0) return colors

    const color = new Color()
    color.H = 0
    color.L = 0.5
    color.S = 1
    const hueStep = 1 / layers.length
    for (const layer of layers) {
        color.hsl2rgb()
        colors[layer] = {
            enabled: true,
            color: color.toArrayRGBA(),
        }
        color.H += hueStep
    }
    return colors
}
