import React from "react"
import {
    ErrorBoundary,
    IconLoading,
    IconPlug,
    IconReload,
    ViewButton,
    ViewPanel,
    useThrowableAsyncCallback,
} from "@tolokoban/ui"

import { State } from "@/state"
import { InputText } from "@/view/InputText"
import { InputNumber } from "@/view/InputNumber"
import { Service } from "@/service/service"
import { goto } from "../routes"

export default function Page() {
    const [hostname, setHostname] = State.service.host.useState()
    const [portBrayns, setPortBrayns] = State.service.portBrayns.useState()
    const [portBackend, setPortBackend] = State.service.portBackend.useState()
    const [handleConnect, busy, message] = useConnectHandler(
        hostname,
        portBrayns,
        portBackend
    )
    return (
        <ViewPanel
            fullsize
            display="flex"
            justifyContent="space-around"
            alignItems="center"
        >
            <Panel>
                <InputText
                    label="Hostname (ex.: r1i4n35)"
                    value={hostname ?? ""}
                    onChange={setHostname}
                    onEnterKeyPressed={handleConnect}
                />
                <InputNumber
                    label="Brayns port"
                    value={portBrayns}
                    onChange={setPortBrayns}
                />
                <InputNumber
                    label="Backend port"
                    value={portBackend}
                    onChange={setPortBackend}
                />
                <ViewButton
                    icon={IconPlug}
                    enabled={Boolean(hostname && hostname.trim().length > 0)}
                    onClick={handleConnect}
                    waiting={busy}
                >
                    Connect to existing service
                </ViewButton>
                {busy && message && (
                    <ViewPanel
                        color="neutral-3-8"
                        position="absolute"
                        display="grid"
                        placeItems="center"
                        fontSize="150%"
                        fullsize
                    >
                        <div>
                            <b>{message}</b>
                        </div>
                        <IconLoading animate={true} />
                    </ViewPanel>
                )}
            </Panel>
        </ViewPanel>
    )
}

function Panel({ children }: { children: React.ReactNode }) {
    const [error, setError] = React.useState<Error | null>(null)
    const handleError = (error: Error, info: React.ErrorInfo) => {
        console.error(error)
        console.warn(info)
        setError(error)
    }
    return (
        <ViewPanel
            color="neutral-3"
            width="320px"
            height="320px"
            display="grid"
            placeItems="center"
            shadow={9}
        >
            <ErrorBoundary
                onError={handleError}
                fallback={
                    <>
                        <ViewPanel color="error" gap="M" margin="M">
                            {error && <p>{error.message}</p>}
                        </ViewPanel>
                        <ViewButton
                            icon={IconReload}
                            onClick={() => window.location.reload()}
                        >
                            Try again
                        </ViewButton>
                    </>
                }
            >
                {children}
            </ErrorBoundary>
        </ViewPanel>
    )
}

function useConnectHandler(
    hostname: string | null,
    portBrayns: number,
    portBackend: number
): [() => void, boolean, string | null] {
    const [busy, setBusy] = React.useState(false)
    const [message, setMessage] = React.useState<string | null>(null)
    const handleConnect = useThrowableAsyncCallback(async () => {
        if (!hostname) return

        setBusy(true)
        Service.eventMessageConnect.addListener(setMessage)
        try {
            setMessage(`Connecting "${hostname}"...`)
            const connected = await Service.connect(hostname, {
                brayns: portBrayns,
                backend: portBackend,
            })
            if (!connected) throw Error(`Unable to connect to "${hostname}"!`)

            State.service.host.value = Service.hostname
        } finally {
            setBusy(false)
            Service.eventMessageConnect.removeListener(setMessage)
            goto("/scene")
        }
    }, [])
    return [handleConnect, busy, message]
}
