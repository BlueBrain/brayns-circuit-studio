import StorageInterface from "../../storage"

/**
 * Storage for all the user preferences.
 * These items will persist through all the brayns sessions.
 */
export default abstract class UserStorageServiceInterface extends StorageInterface {
    readonly type = "user"
}
