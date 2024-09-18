import { ColorGradient } from "@/_old_/contract/service/colors"
import { Vector4 } from "@/_old_/contract/tool/calc"

export function computeColorAtOffset(
    offset: number,
    steps: ColorGradient
): Vector4 {
    if (steps.length === 0) return [0, 0, 0, 1]

    if (offset <= 0) {
        const [red, green, blue, alpha] = steps[0].color
        return [red, green, blue, alpha]
    }

    for (let index = 1; index < steps.length; index++) {
        const stepB = steps[index]
        if (stepB.offset > offset) {
            const stepA = steps[index - 1]
            const t = (offset - stepA.offset) / (stepB.offset - stepA.offset)
            const [redA, greenA, blueA, alphaA] = stepA.color
            const [redB, greenB, blueB] = stepB.color
            return [
                interpolate(redA, redB, t),
                interpolate(greenA, greenB, t),
                interpolate(blueA, blueB, t),
                alphaA,
            ]
        }
    }
    return steps[steps.length - 1].color
}

function interpolate(from: number, to: number, alpha: number): number {
    return (1 - alpha) * from + alpha * to
}
