import React from "react"
import AboutView from "@/_old_/view/about"
import { useModal } from "@/_old_/ui/modal"
import { useServiceLocator } from "@/_old_/tool/locator"
import { ensureBraynsApiServiceInterface } from "@/_old_/contract/service/brayns-api/brayns-api"
import { ensureBackendManagerInterface } from "../../../contract/manager/backend"

export function useAboutHandler() {
    const modal = useModal()
    const { brayns, backend } = useServiceLocator({
        brayns: ensureBraynsApiServiceInterface,
        backend: ensureBackendManagerInterface,
    })
    const handler = React.useCallback(() => {
        const hide = modal.show({
            content: (
                <AboutView
                    renderer={brayns}
                    backend={backend}
                    onClose={() => hide()}
                />
            ),
        })
    }, [modal, brayns])
    return handler
}
