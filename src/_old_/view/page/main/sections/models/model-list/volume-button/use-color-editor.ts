import { VolumeModel } from "@/_old_/contract/manager/models"
import { extractSolidColor } from "@/_old_/contract/manager/models/types/model-types"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { useServiceLocator } from "@/_old_/tool/locator"
import { useAskColor } from "@/_old_/user-input/color"

export function useColorEditor(): (volume: VolumeModel) => Promise<boolean> {
    const askColor = useAskColor()
    const { scene } = useServiceLocator({ scene: ensureSceneManagerInterface })
    return async (volume: VolumeModel) => {
        const color = await askColor({
            title: "Volume color",
            currentColor: extractSolidColor(volume.colors),
            showOpacity: true,
        })
        if (!color) return false

        return await scene.models.volume.updateColor(volume.id, {
            method: "solid",
            values: { color },
        })
    }
}
