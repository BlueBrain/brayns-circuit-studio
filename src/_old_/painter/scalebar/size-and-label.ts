/**
 * Human-friendly values to display.
 * We want a list of numbers that a human can mentally multiply.
 * That's why we will avoid 13, 17, etc...
 */
const SNAPPING = [
    // eslint-disable-next-line no-magic-numbers
    1, 2, 5, 10, 20, 25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900,
]

export interface ScaleBarSizeAndLabel {
    barWidth: number
    label: string
}

export function getScaleBarSizeAndLabel(
    preferedSize: number,
    micrometersPerPixel: number
): ScaleBarSizeAndLabel {
    const { radix, exponent } = clampToNearestGroupOfThreeDigits(
        preferedSize * micrometersPerPixel
    )
    const snappedRadix = snapToNearestFriendlyValue(radix)
    const TEN = 10
    return {
        label: `${snappedRadix} ${getUnit(exponent)}`,
        barWidth: (snappedRadix * TEN ** exponent) / micrometersPerPixel,
    }
}

/**
 * We choose the unit to have the less possible digits to display.
 */
function getUnit(exponent: number): string {
    const NANOMETER_EXPONENT = -3
    const MICROMETER_EXPONENT = 0
    const MILIMETER_EXPONENT = 3
    const METER_EXPONENT = 6
    if (exponent < NANOMETER_EXPONENT) return `10^${exponent} µm`
    if (exponent > METER_EXPONENT) return `10^${exponent - METER_EXPONENT} m`
    switch (exponent) {
        case NANOMETER_EXPONENT:
            return "nm"
        case MICROMETER_EXPONENT:
            return "µm"
        case MILIMETER_EXPONENT:
            return "mm"
        case METER_EXPONENT:
            return "m"
        default:
            throw Error(
                `Exponent (${exponent}) must be a integral multiple of 3!`
            )
    }
}

/**
 * Compute a `radix` between 0 and 1000
 * and the `exponent` that validates
 * radix * Math.pow(10, component) === value
 */
function clampToNearestGroupOfThreeDigits(value: number) {
    const TEN = 10
    const GROUP_BY_THOUSANDS = 3
    const exponent =
        Math.floor(Math.log10(value) / GROUP_BY_THOUSANDS) * GROUP_BY_THOUSANDS
    return {
        exponent,
        radix: value * TEN ** -exponent,
    }
}

/**
 * @returns The nearest human-friendly number to `value`.
 */
function snapToNearestFriendlyValue(value: number) {
    let nearestTarget = SNAPPING[0]
    let nearestDistance = Math.abs(value - nearestTarget)
    for (let i = 1; i < SNAPPING.length; i++) {
        const target = SNAPPING[i]
        const distance = Math.abs(value - target)
        if (distance < nearestDistance) {
            nearestDistance = distance
            nearestTarget = target
        }
    }
    return nearestTarget
}
