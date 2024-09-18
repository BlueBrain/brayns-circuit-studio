import * as CryptoJS from "crypto-js"
import { ExpirableValue } from "./types"

const CODE_VERIFIER_LENGTH = 128
const CODE_VERIFIER_CHARACTERS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

export function generateCodeChallenge(verifier: ExpirableValue): string {
    return base64URL(CryptoJS.SHA256(verifier.value))
}

export function generateCodeVerifier(): ExpirableValue {
    let value = ""
    const charactersLength = CODE_VERIFIER_CHARACTERS.length
    for (let i = 0; i < CODE_VERIFIER_LENGTH; i++) {
        value += CODE_VERIFIER_CHARACTERS.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    const receivedAt = Date.now()
    const expiresAt = receivedAt + 3600 * 1000
    return {
        value,
        expiresAt,
        receivedAt,
    }
}

function base64URL(value: CryptoJS.lib.WordArray): string {
    return value
        .toString(CryptoJS.enc.Base64)
        .replace(/[=]/gu, "")
        .replace(/\+/gu, "-")
        .replace(/\//gu, "_")
}
