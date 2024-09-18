import React from "react"
import { createRoot } from "react-dom/client"
import StartupMode from "../service/backend-allocator/startup-mode"
import BackendAllocatorService from "../service/backend-allocator"
import { isString } from "../tool/validator"
import { BACKEND_URL_QUERY_PARAM } from "@/_old_/constants"

export function allocateIfNeeded(token: string): string | null {
    const params = new URLSearchParams(document.location.search)
    const hostQueryParam = params.get(BACKEND_URL_QUERY_PARAM) ?? ""
    if (hostQueryParam.length) return hostQueryParam

    const account = params.get("account")
    if (isString(account)) {
        const allocator = new BackendAllocatorService(token)
        allocator
            .allocate({
                account,
                onProgress: console.log,
            })
            .then(reloadWithHostParam)
            .catch(console.error)
        return null
    }

    const container = document.getElementById("root") as HTMLElement
    const root = createRoot(container)
    const handleAllocate = async (
        account: string,
        onProgress: (message: string) => void
    ) => {
        const allocator = new BackendAllocatorService(token)
        const backendAddress = await allocator.allocate({ account, onProgress })
        if (backendAddress) reloadWithHostParam(backendAddress)
        else {
            console.log(
                "🚀 [allocate-if-needed] backendAddress = ",
                backendAddress
            ) // @FIXME: Remove this line written on 2023-10-06 at 15:52
            location.href = "error.html"
        }
    }
    root.render(
        <StartupMode
            onAllocateNode={(account, onProgress) =>
                void handleAllocate(account, onProgress)
            }
            onUseExistingBackend={reloadWithHostParam}
        />
    )
    return null
}

function reloadWithHostParam(backendUrl: string) {
    const curParams = new URLSearchParams(window.location.search)
    const newParams = new URLSearchParams()
    newParams.set(BACKEND_URL_QUERY_PARAM, backendUrl)
    const paramsToKeep = ["token", "ui"]
    for (const name of paramsToKeep) {
        const value = curParams.get(name)
        if (typeof value === "string") {
            newParams.set(name, value)
        }
    }
    window.location.search = `?${newParams.toString()}`
}
