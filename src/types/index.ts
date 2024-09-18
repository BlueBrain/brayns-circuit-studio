import { isType } from "@tolokoban/type-guards"

export interface CircuitStudioError {
    code: number
    message: string
    data?: React.ReactNode
    entrypoint?: string
    params?: unknown
    param?: unknown
}

export function isCircuitStudioError(
    data: unknown
): data is CircuitStudioError {
    return isType(data, {
        code: "number",
        message: "string",
    })
}
