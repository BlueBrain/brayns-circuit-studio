import GenericEvent, { GenericEventInterface } from "./generic-event"
import { CLIENT_ID, KEYCLOAK_AUTH_URL, KEYCLOAK_TOKEN_URL } from "./config"
import { createCodeVerifier, getCodeChallenge } from "./crypto"
import { isKeycloakTokenResponse } from "./types"
import { storageDelete, storageLoad, storageSave } from "./storage"

interface LoginServiceInterface {
    login(): void
    getToken(): Promise<string | null>
    readonly isLogged: boolean
}

class LoginService {
    public readonly eventLogged: GenericEventInterface<boolean> =
        new GenericEvent<boolean>()

    private _isLogged = false
    private _token: string | null = null

    /**
     * At startup, we must check if we are coming from a KeyCloak redirection.
     * If so, we can retrieve the authorization code from URL params and ask
     * for a token.
     */
    async initialize(): Promise<void> {
        const codeVerifier = storageLoad("codeVerifier")
        const args = new URLSearchParams(globalThis.window?.location.search)
        const authorizationCode = args.get("code")
        const sessionState = args.get("session_state")
        console.log("🚀 [login] authorizationCode = ", authorizationCode) // @FIXME: Remove this line written on 2022-11-10 at 10:44
        if (!codeVerifier || !authorizationCode || !sessionState) {
            // We are not coming from a KeyCloak redirection.
            return
        }

        storageDelete("codeVerifier")
        const requestParams = {
            client_id: "bbp-sbo-application",
            redirect_uri: globalThis.window?.location.origin,
            grant_type: "authorization_code",
            code: authorizationCode,
            code_verifier: codeVerifier,
        }
        const requestUrl = new URL(KEYCLOAK_TOKEN_URL)
        const requestBody = new URLSearchParams()
        for (const [key, value] of Object.entries(requestParams)) {
            requestBody.append(key, value)
        }
        const request = new Request(requestUrl.toString(), {
            redirect: "follow",
            method: "post",
            headers: [
                ["Content-Type", "application/x-www-form-urlencoded"],
                ["Accept", "application/json"],
            ],
            body: requestBody,
        })
        const response = await fetch(request)
        if (response.ok && response.status === 200) {
            const data = await response.json()
            if (!isKeycloakTokenResponse(data)) {
                console.error("Keycloak returned an expected object:", data)
                return
            }

            this._token = data.access_token
            this.isLogged = true
        }
    }

    login(): void {
        this.isLogged = false
        const codeVerifier = createCodeVerifier()
        storageSave("codeVerifier", codeVerifier)
        const requestParams = {
            client_id: CLIENT_ID,
            redirect_uri: globalThis.window?.location.origin,
            code_challenge: getCodeChallenge(codeVerifier),
            response_type: "code",
            code_challenge_method: "S256",
            scope: "profile openid nexus groups",
        }
        const requestUrl = new URL(KEYCLOAK_AUTH_URL)
        for (const [key, value] of Object.entries(requestParams)) {
            requestUrl.searchParams.append(key, value)
        }
        const win = globalThis.window
        if (win) win.location.href = requestUrl.toString()
    }

    get token() {
        return this._token
    }

    public get isLogged() {
        return this._isLogged
    }

    private set isLogged(value: boolean) {
        this._isLogged = value
        const event = this.eventLogged as GenericEvent<boolean>
        event.dispatch(value)
    }
}

const singleton = new LoginService()
void singleton.initialize()

export default singleton
