import BackendManagerInterface from "@/_old_/contract/manager/backend"
import JSON5 from "json5"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import TableStorage from "../table"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import { BACKEND_URL_QUERY_PARAM } from "@/_old_/constants"

const PREFIX = "@session/"

export default class SessionService extends SessionStorageServiceInterface {
    public readonly type = "session"
    private readonly storage = window.sessionStorage

    constructor(private readonly _backend: BackendManagerInterface) {
        super()
        // This implementation is just here to wait for the Backend.
        // So it uses the local/session storage to save persistent data,
        // but it wipes out everything when we use another host, because
        // we do not want to keep data from different Brayns services.
        // One pitfall here happens when the new Brayns service has the
        // same host as the previous one.
        const { storage } = this
        const args = new URLSearchParams(window.location.search)
        const backendAddress = args.get(BACKEND_URL_QUERY_PARAM) ?? "Unknown"
        if (storage.getItem(PREFIX) !== backendAddress) {
            const itemNames = Object.keys(storage)
            for (const name of itemNames) {
                if (name.startsWith(PREFIX)) {
                    storage.removeItem(name)
                }
            }
            storage.setItem(PREFIX, backendAddress)
        }
    }

    makeTable<T extends { id: number }>(
        tableName: string,
        typeConverter: (arg: unknown) => T | undefined
    ): TableStorageInterface<T> {
        return new TableStorage(this, tableName, typeConverter)
    }

    // Async will be back as soon as we will use the Backend service to
    // store persistent data.
    // eslint-disable-next-line @typescript-eslint/require-await
    async delete(name: string): Promise<void> {
        this.storage.removeItem(name)
    }

    // Async will be back as soon as we will use the Backend service to
    // store persistent data.
    // eslint-disable-next-line @typescript-eslint/require-await
    async load(name: string, defaultValue?: unknown): Promise<unknown> {
        try {
            const { storage } = this
            const data = storage.getItem(`${PREFIX}${name}`)
            if (!data) return defaultValue

            try {
                return JSON5.parse(data)
            } catch (ex) {
                console.warn("Invalid data:", data)
                console.warn(ex)
                return defaultValue
            }
        } catch (ex) {
            console.error(
                `SessionService was unable to load variable "${name}":`,
                ex
            )
            throw ex
        }
    }

    // Async will be back as soon as we will use the Backend service to
    // store persistent data.
    // eslint-disable-next-line @typescript-eslint/require-await
    async save(name: string, value: unknown): Promise<void> {
        this.storage.setItem(`${PREFIX}${name}`, JSON5.stringify(value))
    }

    // Async will be back as soon as we will use the Backend service to
    // store persistent data.
    // eslint-disable-next-line @typescript-eslint/require-await
    async list(): Promise<string[]> {
        return Array.from(Object.keys(this.storage))
    }
}
