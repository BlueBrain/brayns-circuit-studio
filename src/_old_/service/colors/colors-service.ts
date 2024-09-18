import { EMPTY_FUNCTION } from "@/_old_/constants"
import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import { Vector4 } from "@/_old_/contract/tool/calc"
import {
    assertObject,
    assertStringArray,
    assertVector2,
    assertVector4Array,
} from "@/_old_/tool/validator"
import { computeColorAtOffset } from "./color-conversion"
import {
    ColorByGIDs,
    ColorGradient,
    ColorRGBA,
    ColorServiceInterface,
} from "@/_old_/contract/service/colors"

export default class ColorService implements ColorServiceInterface {
    constructor(private readonly service: JsonRpcServiceInterface) {}

    async applyUniqueColor(modelId: number, color: ColorRGBA): Promise<void> {
        await this.service.exec("color-model", {
            id: modelId,
            method: "solid",
            values: { color },
        })
    }

    async applyColorToCells(
        modelId: number,
        colors: ColorByGIDs[],
        setProgress: (percent: number) => void = EMPTY_FUNCTION
    ): Promise<void> {
        try {
            setProgress(0)
            const count = colors.length
            let progress = 0
            for (const { color, rangeDefinition } of colors) {
                setProgress((progress + 0.5) / count)
                progress++
                await this.service.exec("color-model", {
                    id: modelId,
                    method: "id",
                    values: {
                        [rangeDefinition]: color,
                    },
                })
            }
        } catch (ex) {
            console.error(ex)
            throw ex
        } finally {
            setProgress(1)
        }
    }

    async getAvailableColorSchemes(modelId: number): Promise<string[]> {
        const data = await this.service.exec("get-color-methods", {
            id: modelId,
        })
        assertStringArray(data, "data")
        return data
    }

    async getColorSchemeOptions(
        modelId: number,
        colorSchemeName: string
    ): Promise<string[]> {
        const data = await this.service.exec("get-color-values", {
            id: modelId,
            method: colorSchemeName,
        })
        assertStringArray(data, "data")
        return data
    }

    async applyColorScheme(
        modelId: number,
        colorSchemeName: string,
        values: { [name: string]: ColorRGBA }
    ): Promise<void> {
        await this.service.exec("color-model", {
            id: modelId,
            method: colorSchemeName,
            values,
        })
    }

    async getGradient(modelId: number): Promise<{
        gradient: ColorGradient
        range: [min: number, max: number]
    }> {
        const transferFunction = await this.service.exec("get-color-ramp", {
            id: modelId,
        })
        assertTransferFunction(transferFunction)
        return {
            gradient: getGradientFromTransferFunction(transferFunction),
            range: transferFunction.range,
        }
    }

    async setGradient(
        modelId: number,
        gradient: ColorGradient,
        minRange: number,
        maxRange: number
    ): Promise<void> {
        const STEPS = 256
        const colors: Vector4[] = []
        for (let step = 0; step < STEPS; step++) {
            const offset = step / (STEPS - 1)
            colors.push(computeColorAtOffset(offset, gradient))
        }
        await this.service.exec("set-color-ramp", {
            id: modelId,
            color_ramp: {
                colors,
                range: [minRange, maxRange],
            },
        })
    }
}

interface TransferFunction {
    colors: Vector4[]
    range: [number, number]
}

function assertTransferFunction(
    data: unknown
): asserts data is TransferFunction {
    assertObject(data)
    const { colors, range } = data
    assertVector4Array(colors, "data.colors")
    assertVector2(range, "data.range")
}

function getGradientFromTransferFunction(
    transferFunction: TransferFunction
): ColorGradient {
    const gradient: ColorGradient = []
    const colors: Vector4[] = transferFunction.colors
    fillGradientBySections(gradient, colors, 0, colors.length - 1)
    return [
        { offset: 0, color: colors[0] },
        ...gradient,
        { offset: 1, color: colors[colors.length - 1] },
    ]
}

// Colors are supposed equals if their distances is lower than DIST_THRESHOLD.
const DIST_THRESHOLD = 3e-4

/**
 * We need to have gradient stop colors from an array of colors of any size.
 * This array is like a curve that we will approximate with lines.
 */
function fillGradientBySections(
    gradient: ColorGradient,
    colors: Vector4[],
    indexStart: number,
    indexEnd: number
) {
    if (indexEnd - indexStart < 2) return

    const [indexBetween, distance]: [number, number] =
        findFartherPointFromStraightLine(colors, indexStart, indexEnd)
    fillGradientBySections(gradient, colors, indexStart, indexBetween)
    if (distance > DIST_THRESHOLD) {
        const color = colors[indexBetween]
        const offset = indexBetween / (colors.length - 1)
        gradient.push({ offset, color })
    }
    fillGradientBySections(gradient, colors, indexBetween, indexEnd)
}

function findFartherPointFromStraightLine(
    colors: Vector4[],
    indexStart: number,
    indexEnd: number
): [index: number, distance: number] {
    let bestIndex = indexStart + 1
    let bestDistance = 0
    const [rA, gA, bA] = colors[indexStart]
    const [rB, gB, bB] = colors[indexEnd]
    for (let index = indexStart + 1; index < indexEnd; index++) {
        const [red, green, blue] = colors[index]
        const beta = (index - indexStart) / (indexEnd - indexStart)
        const alpha = 1 - beta
        const rM = alpha * rA + beta * rB
        const gM = alpha * gA + beta * gB
        const bM = alpha * bA + beta * bB
        const deltaR = rM - red
        const deltaG = gM - green
        const deltaB = bM - blue
        const distance = deltaR * deltaR + deltaG * deltaG + deltaB * deltaB
        if (distance > bestDistance) {
            bestDistance = distance
            bestIndex = index
        }
    }
    return [bestIndex, bestDistance]
}
