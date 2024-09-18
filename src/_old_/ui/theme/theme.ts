import "./theme.css"

import { double, half } from "@/_old_/constants"

import Color from "../color"
import CssVarManager from "./css-var-manager"

const CSS_PREFIX = "theme"
const CSS_COLOR = "-color"
const CSS_ON = "-on"
const CSS_COLOR_PRIMARY = "-primary"
const CSS_COLOR_PRIMARY_LIGHT = "-primary-light"
const CSS_COLOR_PRIMARY_DARK = "-primary-dark"
const CSS_COLOR_ACCENT = "-accent"
const CSS_COLOR_ACCENT_LIGHT = "-accent-light"
const CSS_COLOR_ACCENT_DARK = "-accent-dark"
const CSS_COLOR_ERROR = "-error"
const CSS_COLOR_SCREEN = "-screen"
const CSS_COLOR_FRAME = "-frame"
const CSS_COLOR_SECTION = "-section"
const CSS_COLOR_INPUT = "-input"
const CSS_COLOR_WHITE = "-white"
const CSS_COLOR_BLACK = "-black"
const CSS_COLOR_LINK = "-link"
const CSS_OPACITY = "-opacity-"
const CSS_SHADOW = "-shadow"

interface ColorPalette {
    dark: string
    base: string
    light: string
}

export interface ThemeSettings {
    colors: {
        primary: ColorPalette
        accent: ColorPalette
        error: string
        screen: string
        frame: string
        section: string
        input: string
        white: string
        black: string
    }
}

type ColorNames =
    | "primary"
    | "primary-light"
    | "primary-dark"
    | "accent"
    | "accent-light"
    | "accent-dark"
    | "error"
    | "screen"
    | "frame"
    | "section"
    | "input"
    | "white"
    | "black"
    | "link"

const Theme = {
    apply,
    get defaultDarkTheme(): ThemeSettings {
        return {
            colors: {
                black: "#000e",
                white: "#fffe",
                error: "#d20",
                screen: "#001325",
                frame: "#081d30",
                section: "#36495e",
                input: "#bbb",
                primary: { dark: "#004569", base: "#5dc4ed", light: "#abffff" },
                accent: makePalette("#e78500"),
            },
        }
    },
}

export default Theme

/**
 * Deduce light and dark colors from the base using luminance.
 */
function makePalette(base: string): ColorPalette {
    const color = new Color(base)
    color.rgb2hsl()
    const darkLuminance = half(color.L)
    const lightLuminance = half(color.L + 1)
    color.L = darkLuminance
    color.hsl2rgb()
    const dark = color.stringify()
    color.L = lightLuminance
    color.hsl2rgb()
    const light = color.stringify()
    return { dark, base, light }
}
/**
 *
 * @param settings All the theme settings are needed. Use a helper function
 * if you want default values to be filled for you.
 * @param target Target element to apply to theme on. If omitted the theme is applied on BODY.
 */
function apply(settings: ThemeSettings, target?: HTMLElement | SVGElement) {
    const vars = new CssVarManager(target)
    applyColors(settings, vars)
    applyShadows(settings, vars)
}

function applyColors(settings: ThemeSettings, vars: CssVarManager) {
    const white = Color.fromColorOrString(settings.colors.white)
    const black = Color.fromColorOrString(settings.colors.black)
    applyColor(vars, "primary", settings.colors.primary.base, white, black)
    applyColor(
        vars,
        "primary-light",
        settings.colors.primary.light,
        white,
        black
    )
    applyColor(vars, "primary-dark", settings.colors.primary.dark, white, black)
    applyColor(vars, "accent", settings.colors.accent.base, white, black)
    applyColor(vars, "accent-light", settings.colors.accent.light, white, black)
    applyColor(vars, "accent-dark", settings.colors.accent.dark, white, black)
    applyColor(vars, "error", settings.colors.error, white, black)
    applyColor(vars, "screen", settings.colors.screen, white, black)
    applyColor(vars, "frame", settings.colors.frame, white, black)
    applyColor(vars, "section", settings.colors.section, white, black)
    applyColor(vars, "input", settings.colors.input, white, black)
    applyColor(vars, "white", settings.colors.white, white, black)
    applyColor(vars, "black", settings.colors.black, white, black)
    vars.set(
        varNameForColor("link"),
        Color.bestContrast(
            settings.colors.frame,
            settings.colors.accent.dark,
            settings.colors.accent.base,
            settings.colors.accent.light
        )
    )
}

function applyColor(
    vars: CssVarManager,
    colorName: ColorNames,
    colorValue: string,
    white: Color,
    black: Color
) {
    const color = Color.fromColorOrString(colorValue)
    vars.set(varNameForColor(colorName), color.stringify())
    const STEP = 5
    const PERCENT = 100
    const INVERSE_PERCENT = 1 / PERCENT
    for (let opacity = STEP; opacity < PERCENT; opacity += STEP) {
        color.A = opacity * INVERSE_PERCENT
        vars.set(varNameForColor(colorName, opacity), color.stringify())
    }
    const colorOn = Color.bestContrast(color, white, black)
    vars.set(varNameForColorOn(colorName), colorOn.stringify())
    for (let opacity = STEP; opacity < PERCENT; opacity += STEP) {
        const transparentColorOn = colorOn.copy()
        transparentColorOn.A = opacity * INVERSE_PERCENT * colorOn.A
        vars.set(
            varNameForColorOn(colorName, opacity),
            transparentColorOn.stringify()
        )
    }
}

const COLOR_CLASSNAME_MAPPING: { [key: string]: string } = {
    "accent-dark": CSS_COLOR_ACCENT_DARK,
    "accent-light": CSS_COLOR_ACCENT_LIGHT,
    "primary-dark": CSS_COLOR_PRIMARY_DARK,
    "primary-light": CSS_COLOR_PRIMARY_LIGHT,
    accent: CSS_COLOR_ACCENT,
    black: CSS_COLOR_BLACK,
    error: CSS_COLOR_ERROR,
    frame: CSS_COLOR_FRAME,
    input: CSS_COLOR_INPUT,
    primary: CSS_COLOR_PRIMARY,
    screen: CSS_COLOR_SCREEN,
    section: CSS_COLOR_SECTION,
    white: CSS_COLOR_WHITE,
    link: CSS_COLOR_LINK,
}

function varNameForColor(color: ColorNames, opacity = 0) {
    const colorClassName = COLOR_CLASSNAME_MAPPING[color]
    return `${CSS_PREFIX}${CSS_COLOR}${colorClassName}${
        opacity > 0 ? `${CSS_OPACITY}${opacity}` : ""
    }`
}

function varNameForColorOn(color: ColorNames, opacity = 0) {
    const colorClassName = COLOR_CLASSNAME_MAPPING[color]
    return `${CSS_PREFIX}${CSS_COLOR}${CSS_ON}${colorClassName}${
        opacity > 0 ? `${CSS_OPACITY}${opacity}` : ""
    }`
}

function applyShadows(settings: ThemeSettings, vars: CssVarManager) {
    // @see: https://material.io/design/environment/elevation.html#default-elevations
    const types = {
        card: 1,
        button: 2,
        header: 4,
        "button-pressed": 8,
        dialog: 24,
    }
    const color = "#000a"
    const scale = 0.0625
    for (const type of Object.keys(types)) {
        const value = types[type] * scale
        vars.set(
            `${CSS_PREFIX}${CSS_SHADOW}-${type}`,
            `0 ${value}rem ${double(value)}rem ${color}`
        )
    }
}
