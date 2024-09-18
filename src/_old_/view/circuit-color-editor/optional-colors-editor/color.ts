import { ColorRGBA } from "@/_old_/contract/service/colors"
import Color from "@/_old_/ui/color"
import { Colors } from "./optional-colors-editor-view"
import { clamp } from "@/_old_/constants"
import { OptionalColor } from "../types"

export function applySingle(names: string[], colors: Colors): Colors {
    let firstColor: ColorRGBA | null = null
    for (const color of keepOnlyEnabledColors(names, colors)) {
        if (firstColor) {
            color.color = [...firstColor]
        } else {
            firstColor = color.color
        }
    }
    return colors
}

const MIN_LUM = 0.25
const MAX_LUM = 0.75
const MIN_SAT = 0.5
const MAX_SAT = 1

export function applyRainbow(names: string[], colors: Colors): Colors {
    const enabledColors = keepOnlyEnabledColors(names, colors)
    if (enabledColors.length < 2) return colors

    const [firstItem] = enabledColors
    const color = Color.fromArrayRGBA(firstItem.color)
    color.rgb2hsl()
    color.L = clamp(color.L, MIN_LUM, MAX_LUM)
    const hueStep = 1 / enabledColors.length
    for (let i = 0; i < enabledColors.length; i++) {
        const item = enabledColors[i]
        color.H += hueStep
        if (color.H > 1) color.H--
        color.hsl2rgb()
        item.color = color.toArrayRGBA()
    }
    return colors
}

export function applyRandom(names: string[], colors: Colors): Colors {
    keepOnlyEnabledColors(names, colors).forEach((item) => {
        const color = new Color()
        color.H = randomFromRange(0, 1)
        color.L = randomFromRange(MIN_LUM, MAX_LUM)
        color.S = randomFromRange(MIN_SAT, MAX_SAT)
        color.hsl2rgb()
        item.color = color.toArrayRGBA()
    })
    return colors
}

function randomFromRange(min: number, max: number) {
    return min + Math.random() * (max - min)
}

function keepOnlyEnabledColors(names: string[], colors: Colors) {
    const filteredColors: OptionalColor[] = []
    for (const name of names) {
        const color = colors[name]
        if (color && color.enabled) filteredColors.push(color)
    }
    return filteredColors
}
