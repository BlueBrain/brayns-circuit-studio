/* eslint-disable class-methods-use-this */

import JsonRpcServiceInterface, {
    JsonRpcQueryFailure,
    JsonRpcQueryResult,
    JsonRpcQuerySuccess,
    JsonRpcServiceAddress,
    JsonRpcUpdate,
    LongTask,
} from "@/_old_/contract/service/json-rpc"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"
import Progress, { ProgressHandler } from "@/_old_/contract/type/progress"
import SerializableData from "@/_old_/contract/type/serializable-data"
import {
    assertType,
    isArrayBuffer,
    isBoolean,
    isNumber,
    isObject,
    isString,
    isStringArray,
} from "@/_old_/tool/validator"
import { sleep } from "../../tool/async"
import GenericEvent from "../../tool/event"
import { CircuitStudioError } from "@/_old_/hooks/error-handler"

/**
 * Function that tells us if an entrypoint has to be traced in the console.
 */
const traceEntryPoint = makeDebugToggler(false)
// makeDebugToggler((name) => name.includes("light") || name.includes("clear"))

/**
 * Used to generate unique IDs for WebSockets queries.
 */
let globalIncrementalId = 0

interface PendingQuery {
    id: string
    entryPointName: string
    timestamp: number
    param?: unknown
    resolve(result: JsonRpcQueryResult): void
    reject(error: CircuitStudioError): void
}

export default class JsonRpcService implements JsonRpcServiceInterface {
    // `true` if WebSocket is connected.
    public readonly eventConnectionStatus: TriggerableEventInterface<boolean>

    public readonly eventUpdate: TriggerableEventInterface<JsonRpcUpdate>

    public readonly address: JsonRpcServiceAddress

    constructor(
        jsonRpcAddress: JsonRpcServiceAddress,
        makeEvent: <T>() => TriggerableEventInterface<T>
    ) {
        this.address = jsonRpcAddress
        this.eventUpdate = makeEvent<JsonRpcUpdate>()
        this.eventConnectionStatus = makeEvent<boolean>()
    }

    readonly exec = async (
        entryPointName: string,
        param?: unknown,
        chunk?: ArrayBuffer | string
    ): Promise<unknown> => {
        try {
            const data = await this.tryToExec(entryPointName, param, chunk)
            if (this.isError(data)) {
                console.error("JsonRpc query failure!", data)
                console.error("   Address:", this.address.toString())
                throw data
            }
            return data.result
        } catch (ex) {
            console.error(
                `Error while calling entry point "${entryPointName}":`,
                param
            )
            console.error(ex)
            throw ex
        }
    }

    execLongTask(
        entryPointName: string,
        param?: unknown,
        onProgress?: ProgressHandler,
        chunk?: ArrayBuffer
    ): LongTask {
        const { ws } = this
        if (!ws) throw Error("JsonRpcService is not connected yet!")

        const id = this.nextId()
        const message = {
            jsonrpc: "2.0",
            id,
            method: entryPointName,
            params: param,
        }
        const eventProgress = new GenericEvent<Progress>()
        const handleBroadcast = makeBroadcastHandle(
            id,
            (progress: Progress) => {
                eventProgress.trigger(progress)
            }
        )
        if (onProgress) {
            eventProgress.add(onProgress)
        }
        const stop = () => {
            this.eventUpdate.remove(handleBroadcast)
        }
        this.eventUpdate.add(handleBroadcast)
        const promise = this.makeLongTaskPromise(
            id,
            entryPointName,
            param,
            stop,
            ws,
            message,
            chunk
        )
        return {
            promise,
            cancel: () => {
                this.eventUpdate.trigger({
                    name: "progress",
                    value: { value: 1, label: "Cancellation..." },
                })
                ws.send(
                    JSON.stringify({
                        jsonrpc: "2.0",
                        method: "cancel",
                        params: { id },
                    })
                )
            },
            eventProgress,
        }
    }

    private makeLongTaskPromise(
        id: string,
        entryPointName: string,
        param: unknown,
        stop: () => void,
        ws: WebSocket,
        message: {
            jsonrpc: string
            id: string
            method: string
            params?: unknown
        },
        chunk?: ArrayBuffer
    ) {
        return new Promise<unknown>((resolve, reject) => {
            this.pendingQueries.set(id, {
                id,
                entryPointName,
                timestamp: Date.now(),
                param: param ?? {},
                resolve: (data: JsonRpcQueryResult) => {
                    stop()
                    if (this.isError(data)) {
                        reject(convertErrorObject(data))
                        return
                    }

                    resolve(data.result)
                },
                reject,
            })
            try {
                traceEntryPoint(">>> LongTask >>>", entryPointName, message)
                const encoder = new TextEncoder()
                const messageData = encoder.encode(JSON.stringify(message))
                const chunkLength = chunk ? getChunkLength(chunk) : 0

                const MESSAGE_OFFSET = Uint32Array.BYTES_PER_ELEMENT
                const buffLength =
                    MESSAGE_OFFSET + messageData.byteLength + chunkLength
                const buff = new ArrayBuffer(buffLength)
                const view = new DataView(buff)
                view.setUint32(0, messageData.byteLength, true)
                const data = new Uint8Array(buff)
                data.set(messageData, MESSAGE_OFFSET)
                if (chunk) {
                    const CHUNK_OFFSET = MESSAGE_OFFSET + messageData.byteLength
                    data.set(ensureChunkArrayBuffer(chunk), CHUNK_OFFSET)
                }
                ws.send(data)
            } catch (ex) {
                console.error(
                    "Unable to send a message through WebSocket: ",
                    ex
                )
                this.pendingQueries.delete(id)
                stop()
                reject(ex)
            }
        })
    }

    isError(data: JsonRpcQueryResult): data is JsonRpcQueryFailure {
        return !data.success
    }

    isSuccess(data: JsonRpcQueryResult): data is JsonRpcQuerySuccess {
        return data.success
    }

    async connect(): Promise<void> {
        const url = this.getWebSocketURL().toString()
        console.log(`Attempting to connect "${url}"...`)
        for (let maxLoops = 0; maxLoops < 5; maxLoops += 1) {
            const success = await this.actualConnect()
            if (success) return
            await sleep(300)
        }
        throw Error(`Unable to connect to WebSocket service "${url}"!`)
    }

    private actualConnect(): Promise<boolean> {
        if (this.ws) {
            try {
                this.ws.close()
            } catch (ex) {
                console.error(
                    `Unable to close WSS connection to "${this.getWebSocketURL().toString()}"!`
                )
            }
            delete this.ws
        }
        return new Promise((resolve) => {
            const url = this.getWebSocketURL()
            const handleError = (ex: unknown) => {
                console.error(
                    `Unable to connect to JsonRpc Service on "${url.toString()}"!`,
                    ex
                )
                resolve(false)
            }
            const handleConnectionSuccess = () => {
                const { ws } = this
                if (!ws) return

                ws.removeEventListener("open", handleConnectionSuccess)
                ws.removeEventListener("error", handleError)
                resolve(true)
            }
            try {
                const ws = new WebSocket(url)
                this.ws = ws
                // This is very IMPORTANT!
                // With blobs, we have weird bugs when trying to
                // get the videostreaming messages without binaryType = "arraybuffer".
                ws.binaryType = "arraybuffer"
                ws.addEventListener("message", this.handleMessage)
                ws.addEventListener("close", this.handleClose)
                ws.addEventListener("open", this.handleOpen)
                ws.addEventListener("error", this.handleError)
                ws.addEventListener("error", handleError)
                ws.addEventListener("open", handleConnectionSuccess)
            } catch (ex) {
                console.error(
                    `Connection attempt failed to ${url.toString()}!`,
                    ex
                )
                resolve(false)
            }
        })
    }

    readonly tryToExec = async (
        entryPointName: string,
        param?: unknown,
        chunk?: ArrayBuffer | string
    ): Promise<JsonRpcQueryResult> => {
        if (!this.ws) {
            console.error("WebSocket is still undefined!")
            throw Error("JsonRpcService is not connected yet!")
        }

        return new Promise((resolve, reject) => {
            const id = this.nextId()
            const message = {
                jsonrpc: "2.0",
                id,
                method: entryPointName,
                params: param,
            }
            this.pendingQueries.set(id, {
                id,
                entryPointName,
                timestamp: Date.now(),
                param,
                resolve,
                reject,
            })
            try {
                const { ws } = this
                if (!ws) {
                    console.error("WebSocket is now undefined!")
                    throw Error("JsonRpcService is not connected!")
                }
                traceEntryPoint(">>>", entryPointName, param)
                const encoder = new TextEncoder()
                const messageData = encoder.encode(JSON.stringify(message))
                const chunkLength = chunk ? getChunkLength(chunk) : 0
                const buff = new ArrayBuffer(
                    4 + messageData.byteLength + chunkLength
                )
                const view = new DataView(buff)
                view.setUint32(0, messageData.byteLength, true)
                const data = new Uint8Array(buff)
                data.set(messageData, 4)
                if (chunk)
                    data.set(
                        new Uint8Array(ensureChunkArrayBuffer(chunk)),
                        4 + messageData.byteLength
                    )
                ws.send(data)
                // ws.send(JSON.stringify(message))
            } catch (ex) {
                console.error(
                    "Unable to send a message through WebSocket: ",
                    ex
                )
                this.pendingQueries.delete(id)
                reject(ex)
            }
        })
    }

    // #################### PRIVATE ####################

    private ws?: WebSocket

    private readonly pendingQueries = new Map<string, PendingQuery>()

    private readonly resources = new Map<string, SerializableData>()

    private getWebSocketURL() {
        return this.address
    }

    private readonly handleMessage = (event: MessageEvent) => {
        if (typeof event.data === "string") {
            this.handleStringMessage(event.data)
        } else if (isArrayBuffer(event.data)) {
            this.handleBinaryMessage(event.data)
        } else {
            console.error("Invalid JSON-RPC response:", event.data)
        }
    }

    private handleStringMessage(text: string, binaryChunk?: ArrayBuffer) {
        try {
            const data = JSON.parse(text) as SerializableData
            if (!isJsonRpcMessage(data)) {
                console.error("Invalid JSON-RPC format:", data)
                throw Error(`A JSON-RPC object was expected!`)
            }
            const { id, method, result, params, error } = data
            if (!id) {
                traceEntryPoint("<Event>", method, data)
                this.handleSpontaneousUpdate(method, params ?? null)
                return
            }
            if (error) {
                this.handleResponseError(id, convertErrorObject(error))
                return
            }
            if (binaryChunk) {
                if (!isObject(result)) {
                    console.error(
                        "We cannot append the binary chunk a a $data attribute since the result is not an object:",
                        result
                    )
                } else {
                    result.$data = binaryChunk
                }
            }
            this.handleResponse(id, result ?? null)
        } catch (ex) {
            console.error("Unable to parse websocket incoming message:", ex)
            console.error("    text = ", text)
        }
    }

    /**
     * In a binary message, he first Uint32 gives us the length of
     * the text message inside. The rest is pure binary.
     */
    private handleBinaryMessage(data: ArrayBuffer) {
        const view = new DataView(data)
        const txtSize = view.getUint32(0, true)
        const binSize = data.byteLength - 4 - txtSize
        const decoder = new TextDecoder()
        const txt = decoder.decode(data.slice(4, 4 + txtSize))
        const bin = binSize > 0 ? data.slice(4 + txtSize) : undefined
        this.handleStringMessage(txt, bin)
    }

    private handleSpontaneousUpdate(name: string, value: SerializableData) {
        this.eventUpdate.trigger({ name, value })
    }

    private handleResponse(id: string, params: SerializableData) {
        const query = this.pendingQueries.get(id)
        if (typeof query === "undefined") {
            // Just ignore this message because it is not a response
            // to any of our queries.
            return
        }
        traceEntryPoint(
            `<<< ${getDuration(query)}`,
            query.entryPointName,
            params
        )
        this.pendingQueries.delete(id)
        const result: JsonRpcQueryResult = {
            success: true,
            result: params,
            entrypoint: query.entryPointName,
            param: query.param,
        }
        query.resolve(result)
    }

    private handleResponseError(
        id: string,
        error: { code: number; message: string; data?: unknown }
    ) {
        const query = this.pendingQueries.get(id)
        if (typeof query === "undefined") {
            // Just ignore this message because it is not a response
            // to any of our queries.
            console.warn("Unknown query ID:", id)
            return
        }
        this.pendingQueries.delete(id)
        query.resolve({
            success: false,
            // We use 666 to track when the error code is missing.
            code: error.code ?? 666,
            message: error.message ?? "Unknown error!",
            data: isStringArray(error.data) ? error.data : undefined,
            entrypoint: query.entryPointName,
            param: query.param,
        })
    }

    /**
     * @returns Next available ID in Base64 encoding.
     */
    private nextId(): string {
        return btoa(`${globalIncrementalId++}`)
    }

    private readonly handleError = (event) => {
        console.error("### [WS] Error:", event)
    }

    private readonly handleClose = () => {
        this.eventConnectionStatus.trigger(false)
    }

    private readonly handleOpen = () => {
        this.eventConnectionStatus.trigger(true)
    }
}

function makeBroadcastHandle(id: string, onProgress?: ProgressHandler) {
    return (update: JsonRpcUpdate) => {
        if (!onProgress) return
        const { value } = update
        if (!isObject(value)) {
            console.error("Bad format for progress:", update)
            return
        }
        const {
            amount,
            operation,
            id: progressId,
        } = value as {
            [key: string]: SerializableData
        }
        if (id !== progressId) return
        onProgress({
            value: isNumber(amount) ? amount : 0,
            label: isString(operation) ? operation : "Loading...",
        })
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isJsonRpcMessage(data: any): data is {
    id?: string | null
    method: string
    result?: SerializableData
    params?: SerializableData
    error?: {
        code: number
        message?: string
        name?: string
        data?: string[] | null
    }
} {
    try {
        assertType(data, {
            id: ["?", ["|", "string", "null"]],
            method: ["?", "string"],
            result: ["?", "unknown"],
            params: ["?", "unknown"],
            error: [
                "?",
                {
                    code: "number",
                    message: ["?", "string"],
                    name: ["?", "string"],
                    data: ["?", ["|", "null", ["array", "string"]]],
                },
            ],
        })
        return true
    } catch (ex) {
        console.error("We received an invalid JSON message:", data)
        console.error(ex)
        return false
    }
}

/**
 * It can be useful to trace some calls in the console.
 * `createDebugToggler` returns a function which willonly log
 * methods that are allowed to be.
 * @param arg Different ways on filtering entrypoints:
 *  * `false`: no trace at all.
 *  * `true`: trace all entrypoints.
 *  * `string`: trace entrypoints whose name contains `arg`.
 *  * `string[]`: trace only entrypoints whose names are in the array `arg`.
 *  * `(method: string) => boolean`: custom function.
 */
function makeDebugToggler(
    criteria: boolean | string | string[] | ((method: string) => boolean)
): (prefix: string, method: string, data: unknown) => void {
    return (prefix: string, method: string, data: unknown) => {
        if (!isTracable(method, criteria)) return
        console.log(prefix, method, data)
    }
}

function isTracable(
    method: string,
    criteria:
        | boolean
        | string
        | string[]
        | RegExp
        | ((method: string) => boolean)
) {
    if (isBoolean(criteria)) return criteria === true
    if (isString(criteria)) return criteria === method
    if (Array.isArray(criteria)) return criteria.includes(method)
    if (criteria instanceof RegExp) {
        criteria.lastIndex = -1
        return criteria.test(method)
    }
    return criteria(method)
}

function getDuration(query: PendingQuery) {
    return `(${Date.now() - query.timestamp} ms)`
}

function getChunkLength(chunk: string | ArrayBuffer) {
    if (isString(chunk)) return chunk.length

    return chunk.byteLength
}

function ensureChunkArrayBuffer(chunk: string | ArrayBuffer): Uint8Array {
    if (!isString(chunk)) return new Uint8Array(chunk)

    const encoder = new TextEncoder()
    const data = encoder.encode(chunk)
    return data
}

function convertErrorObject(error: {
    code: number
    message?: string
    name?: string
    data?: string | string[] | null
}): { code: number; message: string; data?: unknown } {
    const { code, message, data } = error
    console.log("🚀 [json-rpc-service] error = ", error) // @FIXME: Remove this line written on 2024-01-31 at 10:43
    return {
        code,
        message: message ?? `Error #${code}`,
        data,
    }
}
