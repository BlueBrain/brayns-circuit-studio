import * as CryptoJS from "crypto-js"

const CODE_VERIFIER_LENGTH = 128
const CODE_VERIFIER_CHARACTERS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

export function base64URL(value: CryptoJS.lib.WordArray): string {
    return value
        .toString(CryptoJS.enc.Base64)
        .replace(/[=]/gu, "")
        .replace(/\+/gu, "-")
        .replace(/\//gu, "_")
}

export function generateCodeChallenge(verifier: string): string {
    return base64URL(CryptoJS.SHA256(verifier))
}

export function generateCodeVerifier(): string {
    let result = ""
    const charactersLength = CODE_VERIFIER_CHARACTERS.length
    for (let i = 0; i < CODE_VERIFIER_LENGTH; i++) {
        result += CODE_VERIFIER_CHARACTERS.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    return result
}
