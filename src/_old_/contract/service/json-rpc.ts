import Progress from "@/_old_/contract/type/progress"
import EventInterface from "@/_old_/contract/tool/event"
import SerializableData from "../type/serializable-data"
import { isBoolean, isNumber, isObject, isString } from "@/_old_/tool/validator"
import { ProgressHandler } from "../type/progress"

export interface LongTask {
    /**
     * Call this function to cancel the task before its normal end.
     * You will get an error in the promise though.
     */
    cancel(): void
    promise: Promise<unknown>
    eventProgress: EventInterface<Progress>
}

export interface JsonRpcUpdate {
    name: string
    value: SerializableData
}

export type JsonRpcServiceAddress = URL

interface JsonRpcQuery {
    entrypoint: string
    param?: unknown
}

export interface JsonRpcQuerySuccess extends JsonRpcQuery {
    success: true
    result: unknown
}

export interface JsonRpcQueryFailure extends JsonRpcQuery {
    success: false
    code: number
    message: string
    data?: string[]
}

export function isJsonRpcQueryFailure(
    data: unknown
): data is JsonRpcQueryFailure {
    if (!isObject(data)) return false
    const { success, code, message } = data
    return isBoolean(success) && isNumber(code) && isString(message)
}

export type JsonRpcQueryResult = JsonRpcQuerySuccess | JsonRpcQueryFailure

export default interface JsonRpcServiceInterface {
    readonly address: JsonRpcServiceAddress
    // Triggers when JsonRpc send us unsollicited updates.
    eventUpdate: EventInterface<JsonRpcUpdate>
    // `true` means that the WebSocket is connected.
    eventConnectionStatus: EventInterface<boolean>
    // Try yo connect to JSON RPC server. Throws an exception in case of failure.
    connect(): Promise<void>
    /**
     * Call a JsonRpc entrypoint and return the result.
     * Throws an exception in case of failure.
     * @param entryPointName "get-camera", "get-scene", 'add-light", ...
     * @param param A serializable param for the entry point.
     * @param data A binary chunk you want to add to the query.
     */
    exec(
        entryPointName: string,
        param?: unknown,
        data?: ArrayBuffer | string
    ): Promise<unknown>

    /**
     * A long task can be cancelled and can provide progress feedbacks.
     * @see exec()
     * @param onProgress If defined, this function will be called with the current progress.
     * `value` is set between 0 and 1 (task completed).
     */
    execLongTask(
        entryPointName: string,
        param?: unknown,
        onProgress?: ProgressHandler,
        data?: string | ArrayBuffer
    ): LongTask

    /**
     * Execute a remote function and return the result object which tells you
     * if the query failed or succeded.
     * This method doesn't throw any exception.
     *
     * Test the return with `isJsonRpcQueryFailure`.
     */
    tryToExec(
        entryPointName: string,
        param?: unknown,
        chunk?: string | ArrayBuffer
    ): Promise<JsonRpcQueryResult>

    /**
     * @see tryToExec()
     */
    isError(data: JsonRpcQueryResult): data is JsonRpcQueryFailure

    /**
     * @see tryToExec()
     */
    isSuccess(data: JsonRpcQueryResult): data is JsonRpcQuerySuccess
}
