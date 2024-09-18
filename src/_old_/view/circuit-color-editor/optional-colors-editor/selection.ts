import { Colors } from "./optional-colors-editor-view"

export function selectOnly(value: Colors, name: string): Colors {
    const colors = deselectAll(value)
    const color = colors[name]
    if (color) color.enabled = true
    return colors
}

export function selectAll(value: Colors): Colors {
    const newColors: Colors = {}
    for (const key of Object.keys(value)) {
        newColors[key] = {
            enabled: true,
            color: [...value[key].color],
        }
    }
    return newColors
}

export function deselectAll(value: Colors): Colors {
    const newColors: Colors = {}
    for (const key of Object.keys(value)) {
        newColors[key] = {
            enabled: false,
            color: [...value[key].color],
        }
    }
    return newColors
}

export function invertSelection(value: Colors): Colors {
    const newColors: Colors = {}
    for (const key of Object.keys(value)) {
        const { color, enabled } = value[key]
        newColors[key] = {
            enabled: !enabled,
            color: [...color],
        }
    }
    return newColors
}

export function extractEnabledColors(value: Colors): Colors {
    const newColors: Colors = {}
    for (const key of Object.keys(value)) {
        const { enabled, color } = value[key]
        if (enabled) {
            newColors[key] = { enabled, color }
        }
    }
    return newColors
}
