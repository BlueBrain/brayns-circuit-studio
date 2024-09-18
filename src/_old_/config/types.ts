type Protocol = "ws:" | "wss:"

export interface AppConfiguration {
    authClientId: string
    authRedirectUri: string
    authSSOUrl: string
    authTokenUrl: string
    unicoreUrl: string
    allocationMemory: string
    allocationAccount: string
    allocationPartition: string
    braynsPort: string
    braynsProtocol: Protocol
    backendPort: string
    backendProtocol: Protocol
}
