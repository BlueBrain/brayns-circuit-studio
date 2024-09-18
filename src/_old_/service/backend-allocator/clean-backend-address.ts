import { createUrl } from "@/_old_/tool/urls"

/**
 * Possible inputs should include:
 *   wss://r2i1n5.bbp.epfl.ch:8000 (full URL, everything explicit)
 *   r2i1n5:8000 ("wss" assumed by default)
 *   r2i1n5 (port number and protocol automatically guessed)
 */
const RX_IP = /^([0-9]+\.){3}[0-9]+(:[0-9]+)?$/i
const RX_BB5_NODE_NAME = /^[a-z][a-z0-9]+$/i
const RX_BB5_NODE_HOSTNAME = /^[a-z][a-z0-9]+\.bbp\.epfl\.ch$/i
const RX_BB5_NODE_NAME_AND_PORT = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*:[0-9]+$/i
const ALLOWED_BACKEND_PROTOCOLS = ["ws:", "wss:"]

interface PortAndProtocolParams {
    protocol: string
    port: string
}

export function getCleanServiceUrl(
    address: string | null,
    defaultValues: PortAndProtocolParams
): URL | null {
    if (address === null) {
        return null
    }
    let fullUrl: URL | null = null
    if (RX_BB5_NODE_NAME.test(address)) {
        fullUrl = createUrl({
            host: `${address}.bbp.epfl.ch`,
            port: defaultValues.port,
            protocol: defaultValues.protocol,
        })
    } else if (RX_BB5_NODE_HOSTNAME.test(address)) {
        fullUrl = createUrl({
            host: address,
            port: defaultValues.port,
            protocol: defaultValues.protocol,
        })
    } else if (RX_BB5_NODE_NAME_AND_PORT.test(address)) {
        const addressParts = address.split(":", 2)
        let host = addressParts[0]
        if (RX_BB5_NODE_NAME.test(host)) {
            host = `${host}.bbp.epfl.ch`
        }
        fullUrl = createUrl({
            host,
            port: addressParts[1],
            protocol: defaultValues.protocol,
        })
    } else if (RX_IP.test(address)) {
        const [host, port] = address.split(":", 2)
        fullUrl = createUrl({
            host,
            port: port ?? defaultValues.port,
            protocol: defaultValues.protocol,
        })
    } else {
        try {
            fullUrl = new URL(address)
            if (!ALLOWED_BACKEND_PROTOCOLS.includes(fullUrl.protocol)) {
                fullUrl.protocol = defaultValues.protocol
            }
            if (!fullUrl.port) {
                fullUrl.port = defaultValues.port
            }
        } catch {
            console.warn("Invalid URL")
        }
    }

    if (fullUrl) {
        return fullUrl
    }

    return null
}
