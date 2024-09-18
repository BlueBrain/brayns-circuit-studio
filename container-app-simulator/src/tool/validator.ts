export function isObject(data: unknown): data is { [key: string]: unknown } {
    if (!data) return false
    if (Array.isArray(data)) return false
    return typeof data === "object"
}

export function isNull(data: unknown): data is null {
    return data === null
}

export function isNotNull(data: unknown): boolean {
    return data !== null
}

export function assertObject(
    data: unknown,
    name = "data"
): asserts data is { [key: string]: unknown } {
    if (Array.isArray(data)) {
        console.error(name, data)
        throw Error(`${name} was expected to be an object but we got an array!`)
    }
    if (!isObject(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to be an object but we got ${typeof data}!`
        )
    }
}

export function isString(data: unknown): data is string {
    return typeof data === "string"
}

export function assertString(
    data: unknown,
    name = "data"
): asserts data is string {
    if (!isString(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to be a string but we got ${typeof data}!`
        )
    }
}

/**
 * Return `data` only if it is a string, otherwise throw an exception.
 */
export function ensureFunction(data: unknown): () => void {
    assertFunction(data)
    return data
}

/**
 * Return `data` only if it is a string, otherwise throw an exception.
 */
export function ensureString(data: unknown): string {
    assertString(data)
    return data
}

export function isStringOrIUndefined(
    data: unknown
): data is string | undefined {
    return typeof data === "string" || typeof data === "undefined"
}

export function assertStringOrIUndefined(
    data: unknown,
    name = "data"
): asserts data is string | undefined {
    if (!isStringOrIUndefined(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to ba a string or undefined but we got ${typeof data}!`
        )
    }
}

export function isNumber(data: unknown): data is number {
    return typeof data === "number"
}

export function assertNumber(
    data: unknown,
    name = "data"
): asserts data is number {
    if (!isNumber(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to be a number but we got ${typeof data}!`
        )
    }
}

/**
 * Return `data` only if it is a number, otherwise throw an exception.
 */
export function ensureNumber(data: unknown, name = "data"): number {
    assertNumber(data, name)
    return data
}

/**
 * Return `data` only if it is a boolean, otherwise throw an exception.
 */
export function ensureBoolean(data: unknown, name = "data"): boolean {
    assertBoolean(data, name)
    return data
}

export function ensureUndefined(data: unknown, name = "data"): undefined {
    assertUndefined(data, name)
    return data
}

/**
 * Return `data` only if it is a setter function, otherwise throw an exception.
 */
export function ensureSetter<ValueType>(
    data: unknown,
    name = "data"
): (value: ValueType) => void {
    assertFunction(data, name)
    return data
}

export function isBoolean(data: unknown): data is boolean {
    return typeof data === "boolean"
}

export function isUndefined(data: unknown): data is undefined {
    return typeof data === "undefined"
}

export function assertBoolean(
    data: unknown,
    name = "data"
): asserts data is boolean {
    if (!isBoolean(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to be a boolean but we got ${typeof data}!`
        )
    }
}

export function assertUndefined(
    data: unknown,
    name = "data"
): asserts data is undefined {
    if (!isUndefined(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to be undefined but we got ${typeof data}!`
        )
    }
}

export function assertFunction(
    data: unknown,
    name = "data"
): asserts data is () => void {
    if (typeof data !== "function") {
        console.error(name, data)
        throw Error(
            `${name} was expected to be a function but we got ${typeof data}!`
        )
    }
}

export function isArrayBuffer(data: unknown): data is ArrayBuffer {
    if (!data) return false
    return data instanceof ArrayBuffer
}

export function isStringArray(data: unknown): data is string[] {
    if (!Array.isArray(data)) return false
    for (const item of data) {
        if (!isString(item)) return false
    }
    return true
}

export function assertStringArray(
    data: unknown,
    name = "data"
): asserts data is string[] {
    if (!isStringArray(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to be an array of strings but we got ${typeof data}!`
        )
    }
}

export function isNumberArray(data: unknown): data is number[] {
    if (!Array.isArray(data)) return false
    for (const item of data) {
        if (!isNumber(item)) return false
    }
    return true
}

export function assertNumberArray(
    data: unknown,
    name = "data"
): asserts data is number[] {
    if (!isNumberArray(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to be an array of numbers but we got ${typeof data}!`
        )
    }
}

export function isArray(data: unknown): data is unknown[] {
    return Array.isArray(data)
}

export function assertArray(
    data: unknown,
    name = "data"
): asserts data is unknown[] {
    if (!isArray(data)) {
        console.error(name, data)
        throw Error(
            `${name} was expected to be an array but we got ${typeof data}!`
        )
    }
}

export function assertOptionalArrayBuffer(
    data: unknown,
    suffix = "data"
): asserts data is ArrayBuffer | undefined {
    if (typeof data === "undefined") return
    assertArrayBuffer(data, suffix)
}

export function assertArrayBuffer(
    data: unknown,
    suffix = "data"
): asserts data is ArrayBuffer | undefined {
    if (data instanceof ArrayBuffer) return
    console.error(suffix, data)
    throw Error(`${suffix} was expected to ba an ArrayBuffer!`)
}
