export type ServiceName =
    | "atlas"
    | "backend"
    | "brayns"
    | "calc"
    | "circuitColors"
    | "circuitInfoBbp"
    | "colorrampPainter"
    | "fileSaver"
    | "fileSystem"
    | "lazySnapshot"
    | "loaderParamsFactory"
    | "models"
    | "morphologyCollage"
    | "movieMakerSimple"
    | "nexus"
    | "overlayPainter"
    | "pythonScriptMaker"
    | "refresh"
    | "remoteCommandServer"
    | "scalebarPainter"
    | "scene"
    | "sessionStorage"
    | "sonataInfoService"
    | "storageCollage"
    | "userStorage"

/**
 * A service locator should be injected as dependency to all the components
 * that make heavy use of global services.
 *
 * There is no `register()` method because we want this object to be
 * initialised at startup only.
 */
export default interface ServiceLocatorInterface {
    /**
     * @param serviceName Case sensitive name of the required service.
     * @param ensureType A function that will throw an error if `data`
     * is not of the expected type, and just return it if the type is correct.
     * @return The service whose name has been provided.
     */
    get<T>(serviceName: ServiceName, ensureType: (data: unknown) => T): T
}
