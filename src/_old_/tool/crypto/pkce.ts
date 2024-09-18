import * as CryptoJS from "crypto-js"
import { base64URL } from "./index"

const CODE_VERIFIER_LENGTH = 128
const CODE_VERIFIER_CHARACTERS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

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
