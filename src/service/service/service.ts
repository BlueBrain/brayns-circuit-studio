import { GenericEvent } from "@tolokoban/ui"
import JsonRpcService from "./json-rpc"
import { makeWebsocketURL } from "./url"
import { Renderer } from "./renderer"
import { Backend } from "./backend"

class ServiceClass {
    public readonly eventMessageConnect = new GenericEvent<string>()
    public readonly renderer: Renderer
    public readonly backend: Backend

    private _brayns: JsonRpcService | null = null
    private _backend: JsonRpcService | null = null
    private _hostname: string = ""

    constructor() {
        this.renderer = new Renderer(this.getBrayns)
        this.backend = new Backend(this.getBackend)
    }

    get hostname() {
        return this._hostname
    }

    async connect(
        hostname: string,
        ports: {
            brayns: number
            backend: number
        }
    ): Promise<boolean> {
        if (!this._brayns) {
            this._hostname = sanitizeHostname(hostname)
            this.eventMessageConnect.dispatch(
                `Conencting Brayns on ${this.hostname}:${ports.brayns}...`
            )
            try {
                this._brayns = new JsonRpcService(
                    makeWebsocketURL(this.hostname, ports.brayns)
                )
                await this._brayns.connect()
            } catch (ex) {
                console.error(
                    `Unable to connect Brayns on ${this.hostname}:${ports.brayns}:`,
                    ex
                )
                return false
            }
        }
        if (!this._backend) {
            this._hostname = sanitizeHostname(hostname)
            this.eventMessageConnect.dispatch(
                `Conencting Backend on ${this.hostname}:${ports.backend}...`
            )
            try {
                this._backend = new JsonRpcService(
                    makeWebsocketURL(this.hostname, ports.backend)
                )
                await this._backend.connect()
            } catch (ex) {
                console.error(
                    `Unable to connect Backend on ${this.hostname}:${ports.backend}:`,
                    ex
                )
                return false
            }
        }
        return true
    }

    private readonly getBrayns = (): JsonRpcService => {
        const { _brayns } = this
        if (!_brayns) {
            throw Error("Brayns JSON RPC service has not been connected yet!")
        }

        return _brayns
    }

    private readonly getBackend = (): JsonRpcService => {
        const { _backend } = this
        if (!_backend) {
            throw Error("Backend JSON RPC service has not been connected yet!")
        }

        return _backend
    }
}

export const Service = new ServiceClass()

const RX_BB5 = /^r[0-9]+i[0-9]+n[0-9]+$/g

function sanitizeHostname(hostname: string): string {
    const trimedHostname = hostname.trim()
    RX_BB5.lastIndex = -1
    if (RX_BB5.test(trimedHostname)) return `${trimedHostname}.bbp.epfl.ch`

    return trimedHostname
}
