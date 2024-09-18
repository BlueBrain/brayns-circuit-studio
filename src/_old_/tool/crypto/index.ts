import * as CryptoJS from "crypto-js"

export function base64URL(value: CryptoJS.lib.WordArray): string {
    return value
        .toString(CryptoJS.enc.Base64)
        .replace(/[=]/gu, "")
        .replace(/\+/gu, "-")
        .replace(/\//gu, "_")
}
