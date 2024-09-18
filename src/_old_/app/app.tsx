import {
    BACKEND_URL_QUERY_PARAM,
    BACKEND_URL_STORAGE_KEY,
    BRAYNS_URL_QUERY_PARAM,
} from "@/_old_/constants"
import { ensureBackendManagerInterface } from "@/_old_/contract/manager/backend"
import ServiceLocatorInterface from "@/_old_/contract/service/locator"
import { ServiceLocatorContext } from "@/_old_/tool/locator/locator"
import Dialog from "@/_old_/ui/view/dialog"
import React from "react"
import { createRoot } from "react-dom/client"
import RemoteCommandInterface, {
    ensureRemoteCommandInterface,
} from "../contract/manager/remote-command"
import { ensureSceneManagerInterface } from "../contract/manager/scene"
import RemoteCommand from "../manager/remote-command/remote-command"
import { renderHumanFriendlyErrorContent } from "../ui/modal/manager"
import { ModalProvider } from "../ui/modal/provider"
import AppView from "../view/app"
import { allocateIfNeeded as allocateIfNeededOrReturnBackendAddress } from "./allocate-if-needed"
import "./app.css"
import { makeServiceLocator } from "./factory/service-locator-factory"
import { getCleanServiceUrl } from "@/_old_/service/backend-allocator/clean-backend-address"
import config from "@/_old_/config"

console.log("React version:", React.version)

const EXPORT = { start }

function getQueryParamValue(key: string): string {
    const params = new URLSearchParams(document.location.search)
    return params.get(key) ?? ""
}

async function start(token: string): Promise<boolean> {
    try {
        const backendUrl = getCleanServiceUrl(
            allocateIfNeededOrReturnBackendAddress(token),
            { port: config.backendPort, protocol: config.backendProtocol }
        )
        const braynsUrl = getCleanServiceUrl(
            getQueryParamValue(BRAYNS_URL_QUERY_PARAM) ||
                (backendUrl && backendUrl.hostname),
            {
                port: config.braynsPort,
                protocol: config.braynsProtocol,
            }
        )
        console.log("🚀 [app] backendUrl = ", backendUrl) // @FIXME: Remove this line written on 2024-05-29 at 17:35
        console.log("🚀 [app] braynsUrl = ", braynsUrl) // @FIXME: Remove this line written on 2024-05-29 at 17:35
        if (backendUrl === null || braynsUrl === null) return true

        const serviceLocator = await makeServiceLocator(
            token,
            showProgress,
            backendUrl,
            braynsUrl
        )

        if (!serviceLocator) {
            // We may be waiting for a KeyCloak redirection.
            console.log("We may be waiting for a KeyCloak redirection.")
            return false
        }
        // If no circuit has been loaded yet, reset the camera.
        const scene = serviceLocator.get("scene", ensureSceneManagerInterface)
        const circuitIds = await scene.models.circuit.getIds()
        if (circuitIds.length === 0) scene.camera.reset()
        // Entry point for our app
        createUserInterface(serviceLocator)
        const rc = serviceLocator.get(
            "remoteCommandServer",
            ensureRemoteCommandInterface
        )
        rc.triggerEvent("ready", { host: backendUrl.host })
        return true
    } catch (ex) {
        const rc: RemoteCommandInterface = new RemoteCommand("BCS")
        rc.triggerEvent("fatal")
        fatal(ex)
        return false
    }
}

function showProgress(label: string) {
    console.log("[progress] ", label)
    const progress = document.getElementById("splash-screen-progress")
    if (!progress) {
        console.error('missing mandatory DIV with ID "splash-screen-progress"!')
        return
    }
    progress.textContent = label
}

function createUserInterface(locator: ServiceLocatorInterface) {
    const backend = locator.get("backend", ensureBackendManagerInterface)
    window.localStorage.setItem(
        BACKEND_URL_STORAGE_KEY,
        JSON.stringify(`${backend.address.toString()}`)
    )
    const container = document.getElementById("root") as HTMLElement
    const root = createRoot(container)
    root.render(
        <ServiceLocatorContext.Provider value={locator}>
            <ModalProvider>
                <AppView />
            </ModalProvider>
        </ServiceLocatorContext.Provider>
    )
}

function fatal(ex: unknown) {
    console.error("Unable to start:", ex)
    const errorDiv = document.getElementById("ERROR")
    if (!errorDiv) return

    const root = createRoot(errorDiv)
    root.render(
        <Dialog
            title="Unable to start!"
            hideCancel={true}
            labelOK="Retry"
            flat={true}
            onOK={() => {
                const params = new URLSearchParams(window.location.search)
                params.delete(BACKEND_URL_QUERY_PARAM)
                window.location.search = `?${params.toString()}`
            }}
        >
            <pre
                className="theme-color-error"
                style={{
                    maxWidth: "480px",
                    minHeight: "240px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                }}
            >
                {renderHumanFriendlyErrorContent(ex)}
            </pre>
        </Dialog>
    )
}

export default EXPORT
