export type PersistentData =
    | null
    | boolean
    | number
    | string
    | PersistentData[]
    | { [key: string]: PersistentData }

export interface PersistenceServiceInterface {
    load(name: string, defaultValue: PersistentData): Promise<PersistentData>
    save(name: string, value: PersistentData): Promise<void>
}

export interface AuthenticationServiceInterface {
    authorize(): Promise<string | null | boolean>
    getToken(): Promise<string | null | boolean>
    isAuthorized(): boolean
}

export interface AuthServiceProps {
    clientId: string
    ssoUrl: string
    redirectUri: string
    tokenUrl: string
}

export interface KeycloakTokenResponse {
    access_token: string
    expires_in: number
    refresh_expires_in: number
    refresh_token: string
    token_type: string
    id_token: string
    session_state: string
    scope: string
}
