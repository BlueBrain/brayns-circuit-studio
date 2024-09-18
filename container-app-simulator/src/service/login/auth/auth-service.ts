import { generateCodeChallenge, generateCodeVerifier } from "./pkce"
import {
    AuthenticationServiceInterface,
    AuthServiceProps,
    KeycloakTokenResponse,
    PersistenceServiceInterface,
} from "./types"

const HTTP_200_OK = 200
const HOUR_TO_SECONDS = 3600
const SECOND_TO_MILLISECONDS = 1000

const seconds_to_milliseconds = (seconds: number) =>
    seconds * SECOND_TO_MILLISECONDS

export default class AuthService implements AuthenticationServiceInterface {
    private codeVerifier: string
    private authAccessToken: string
    private authAccessTokenReceivedAt: number | null
    private authAccessTokenExpiresAt: number | null

    constructor(
        private readonly props: AuthServiceProps,
        private readonly persistenceService: PersistenceServiceInterface
    ) {
        this.codeVerifier = ""
        this.authAccessToken = ""
        this.authAccessTokenReceivedAt = null
        this.authAccessTokenExpiresAt = null
    }

    public async authorize() {
        const token = await this.getToken()
        if (token === null) {
            this.redirectToKeycloakAuthorizationPage()
        }
        return token
    }

    public isAuthorized(): boolean {
        const now = Date.now()
        return (
            typeof this.authAccessToken === "string" &&
            this.authAccessToken.length > 0 &&
            this.authAccessTokenExpiresAt !== null &&
            this.authAccessTokenExpiresAt > now
        )
    }

    public async getToken(): Promise<string | null | boolean> {
        if (typeof this.authAccessToken === "string" && this.authAccessToken) {
            return this.authAccessToken
        }
        await this.generateCodeVerifier()
        const queryParams = new URLSearchParams(window.location.search)
        if (queryParams.has("code")) {
            const authorizationCode = queryParams.get("code") as string
            const tokenFromKeycloak = await this.getAccessTokenFromKeycloak(
                authorizationCode
            )
            if (typeof tokenFromKeycloak === "string") {
                return tokenFromKeycloak
            } else {
                return false
            }
        }
        return null
    }

    private redirectToKeycloakAuthorizationPage() {
        const requestParams = {
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            code_challenge: this.getCodeChallenge(),
            response_type: "code",
            code_challenge_method: "S256",
            scope: "profile openid nexus groups",
        }
        const requestUrl = new URL(this.ssoUrl)
        for (const [key, value] of Object.entries(requestParams)) {
            requestUrl.searchParams.append(key, value)
        }
        window.location.href = requestUrl.toString()
    }

    private async getAccessTokenFromKeycloak(
        authorizationCode: string
    ): Promise<string | null | boolean> {
        const requestPayload = {
            client_id: this.clientId,
            grant_type: "authorization_code",
            redirect_uri: this.redirectUri,
            code: authorizationCode,
            code_verifier: this.codeVerifier,
        }
        const requestUrl = new URL(this.tokenUrl)
        const requestBody = new URLSearchParams()
        for (const [key, value] of Object.entries(requestPayload)) {
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
        if (response.status === HTTP_200_OK) {
            const tokenResponse =
                (await response.json()) as KeycloakTokenResponse
            await this.saveAccessToken(tokenResponse)
            window.history.pushState(
                {},
                document.title,
                window.location.pathname
            )
            return tokenResponse.access_token
        }
        return null
    }

    private async saveAccessToken(tokenResponse: KeycloakTokenResponse) {
        const now = Date.now()
        const expiresAt =
            now + seconds_to_milliseconds(tokenResponse.expires_in)
        this.authAccessToken = tokenResponse.access_token
        this.authAccessTokenReceivedAt = now
        this.authAccessTokenExpiresAt = expiresAt
    }

    private get clientId() {
        return this.props.clientId
    }

    private get redirectUri() {
        return this.props.redirectUri
    }

    private get ssoUrl() {
        return this.props.ssoUrl
    }

    private get tokenUrl() {
        return this.props.tokenUrl
    }

    private async generateCodeVerifier() {
        const now = Date.now()
        const cachedCodeVerifier = await this.persistenceService.load(
            "authCodeVerifier",
            null
        )
        const cachedCodeVerifierExpiresAt = await this.persistenceService.load(
            "authCodeVerifierExpiresAt",
            now
        )

        if (
            typeof cachedCodeVerifier === "string" &&
            cachedCodeVerifierExpiresAt &&
            cachedCodeVerifierExpiresAt > now
        ) {
            this.codeVerifier = cachedCodeVerifier
        } else {
            this.codeVerifier = generateCodeVerifier()
            await this.persistenceService.save(
                "authCodeVerifier",
                this.codeVerifier
            )
            await this.persistenceService.save(
                "authCodeVerifierExpiresAt",
                now + seconds_to_milliseconds(HOUR_TO_SECONDS)
            )
        }
    }

    private getCodeChallenge() {
        const verifier = this.codeVerifier
        return generateCodeChallenge(verifier)
    }
}
