export default interface AuthenticationServiceInterface {
    authorize(): Promise<string | null>

    getToken(): Promise<string | null>
}
