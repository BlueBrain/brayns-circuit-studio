declare module "jso-2" {
    export class JSO {
        constructor(options: {
            providerID?: string
            client_id: string
            authorization: string
            redirect_uri?: string
            request: { nonce: null }
            response_type: string
            scopes: {
                request?: string[]
                require?: string[]
            }
        })

        callback(): void

        getToken(): Promise<{
            access_token: string
        }>
    }
}
