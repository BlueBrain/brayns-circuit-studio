import React from "react"
import { useServiceLocator } from "@/_old_/tool/locator"
import { useAskColor } from "../../user-input/color"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { ensureFunction } from "@/_old_/tool/validator"

export function useBackgroundEditor() {
    const askColor = useAskColor()
    const { scene, refresh } = useServiceLocator({
        scene: ensureSceneManagerInterface,
        refresh: ensureFunction,
    })
    return React.useCallback(async () => {
        const color = await askColor({
            title: "Select a color for the Background",
            currentColor: async () => [
                ...(await scene.backgroundColorGet()),
                1,
            ],
            showOpacity: false,
        })
        if (!color) return

        await scene.backgroundColorSet(color)
        refresh()
    }, [askColor, scene, refresh])
}
