import Auth from "./auth"

class ServiceLoginClass {
    async getAuthenticationToken(): Promise<string | null> {
        return Auth.authorize()
    }
}

export const ServiceLogin = new ServiceLoginClass()
