import React from "react"
import {
    IconImport,
    IconLoading,
    ViewFloatingButton,
    ViewPanel,
    ViewStrip,
    useThrowableAsyncEffect,
} from "@tolokoban/ui"

import { version } from "../../../package.json"
import { Service } from "@/service/service"
import { Scene } from "@/view/Scene"
import { makeGoto } from "../routes"

export default function LayoutScene({
    children,
}: {
    children: React.ReactNode
}) {
    const braynsVersion = useBraynsVersion()
    const backendVersion = useBackendVersion()
    return (
        <ViewStrip template="1*" orientation="row" fullsize>
            <ViewStrip template="*1" orientation="column" fullsize>
                <ViewPanel
                    color="primary-5"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    padding={["S", "M"]}
                    fullwidth
                >
                    <div>
                        <ViewFloatingButton
                            icon={IconImport}
                            onClick={makeGoto("/load")}
                        />
                    </div>
                    <div>
                        CircuitStudio <b>{version}</b>
                    </div>
                    <div>
                        Brayns
                        <b>{braynsVersion ?? <IconLoading animate />}</b>
                    </div>
                    <div>
                        Backend
                        <b>{backendVersion ?? <IconLoading animate />}</b>
                    </div>
                    <div></div>
                    <div>{Service.hostname}</div>
                </ViewPanel>
                <Scene />
            </ViewStrip>
            {children}
        </ViewStrip>
    )
}

function useBraynsVersion() {
    const [braynsVersion, setBraynsVersion] = React.useState<string | null>(
        null
    )
    useThrowableAsyncEffect(async () => {
        const data = await Service.renderer.getVersion()
        setBraynsVersion(
            `${data.major}.${data.minor}.${data.patch} (${data.revision})`
        )
    }, [])
    return braynsVersion
}

function useBackendVersion() {
    const [backendVersion, setBackendVersion] = React.useState<string | null>(
        null
    )
    useThrowableAsyncEffect(async () => {
        const data = await Service.backend.getVersion()
        setBackendVersion(data)
    }, [])
    return backendVersion
}
