import { Vector4 } from "./contract/tool/calc"

/**
 * Brayns can be loaded with this command:
 *
 * ```sh
 * module load unstable brayns/${BRAYNS_VERSION}
 * ```
 */
export const BRAYNS_VERSION = "3.8.0"
export const BACKEND_VERSION = "2.4.0"

export const DEFAULT_COLOR: Vector4 = [1, 0.7, 0, 1]

/** Usually the return of an `indexOf` function that failed finding something. */
export const NOT_FOUND = -1

export const NOT_AVAILABLE_YET = -1

/** Used to divide byu 2. */
export const HALF = 0.5

/** Number of degrees in half a turn. */
export const HALF_TURN_IN_DEGREES = 180

/** Number of degrees in half a turn. */
export const QUARTER_TURN_IN_DEGREES = 90

/** Number of radians in one degree. */
export const RADIANS_PER_DEGREE = Math.PI / HALF_TURN_IN_DEGREES

/** Number of degrees in one radian. */
export const DEGREES_PER_RADIAN = HALF_TURN_IN_DEGREES / Math.PI

/** 2 times PI */
export const FULL_TURN_IN_RADIANS = 6.283185307179586

/** Number of seconds per millisecond. */
export const SEC_PER_MS = 0.001

/** Number of milliseconds per second. */
export const MS_PER_SEC = 1000

export const HUNDRED = 100

export const PERCENT = 0.01

/**
 * Because `half(value)` is more readable than `value * HALF`.
 */
export function half(value: number): number {
    return value * HALF
}

/**
 * Pendent of `half()` function.
 */
export function double(value: number): number {
    return value + value
}

export function inverse(value: number): number {
    return 1 / value
}

export function clamp(value: number, min: number, max: number): number {
    if (value < min) return min
    if (value > max) return max
    return value
}

export function clamp01(value: number): number {
    return clamp(value, 0, 1)
}

export const EMPTY_FUNCTION = () => {
    /* Empty fuinction */
}

/**
 * Use this in `Array.at()` to get the last element.
 */
export const LAST_INDEX = -1

/**
 * Max number of cells to display in a slice.
 */
export const DEFAULT_COLLAGE_CELLS_DENSITY = 7

/**
 * Camera height will be multiplied by this value
 * each time the user uses the wheel to zoom in.
 */
export const ZOOM_IN = 0.9
/**
 * Camera height will be multiplied by this value
 * each time the user uses the wheel to zoom out.
 */
export const ZOOM_OUT = 1 / ZOOM_IN

/**
 * When orbiting the camera, how much of angle change when the mouse
 * travels the whole screen.
 */
export const ORBIT_SPEED = Math.PI

export const SECONDS_PER_MINUTE = 60
export const MINUTES_PER_SECOND = 1 / SECONDS_PER_MINUTE

export const MINUTES_PER_HOUR = 60
export const HOURS_PER_MINUTE = 1 / MINUTES_PER_HOUR

export const BACKEND_URL_STORAGE_KEY = "brayns-address-for-direct-connection"

export const BACKEND_URL_QUERY_PARAM = "host"
export const BRAYNS_URL_QUERY_PARAM = "brayns"
