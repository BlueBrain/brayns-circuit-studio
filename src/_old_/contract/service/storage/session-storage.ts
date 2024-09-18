import StorageInterface from "../../storage"

/**
 * A session will persist variables during the life of Brayns instance.
 * This way, event if the browser is refreshed, we can retrieve the variables.
 */
export default abstract class SessionStorageServiceInterface extends StorageInterface {
    readonly type = "session"
}
