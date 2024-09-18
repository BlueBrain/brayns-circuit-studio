import { Service } from "@/service/service"
import { ViewPanel, ViewStrip } from "@tolokoban/ui"

import { version } from "@/../package.json"
import { Scene } from "@/view/Scene"

export default function LayoutScene({
    children,
}: {
    children: React.ReactNode
}) {
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
                        BCS v<b>{version}</b>
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
