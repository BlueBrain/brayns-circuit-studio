import { assertType, isType } from "@/_old_/tool/validator"
import React from "react"

export const ERROR_JAVASCRIPT = -1
export const ERROR_UNKNOWN = -2

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

export function useErrorHandler(): [
    CircuitStudioError | null,
    (value: unknown) => void,
] {
    const [error, setError] = React.useState<CircuitStudioError | null>(null)
    return [
        error,
        (value: unknown) => {
            if (!value) {
                setError(null)
                return
            }
            console.error(value)
            if (value instanceof Error) {
                setError({
                    code: ERROR_JAVASCRIPT,
                    message: value.message,
                })
                return
            }
            if (isServiceError(value)) {
                setError({
                    code: value.code,
                    message: value.message,
                    data: (
                        <>
                            <b>{value.entrypoint}</b>(
                            {JSON.stringify(value.param, null, "  ")})
                        </>
                    ),
                })
                return
            }
            setError({
                code: ERROR_UNKNOWN,
                message: JSON.stringify(value),
            })
        },
    ]
}

interface ServiceError {
    code: number
    message: string
    entrypoint?: string
    param?: unknown
}

function isServiceError(data: unknown): data is ServiceError {
    try {
        assertType(data, {
            code: "number",
            message: "string",
            entrypoint: ["?", "string"],
            param: ["?", "unknown"],
        })
        return true
    } catch (ex) {
        return false
    }
}
