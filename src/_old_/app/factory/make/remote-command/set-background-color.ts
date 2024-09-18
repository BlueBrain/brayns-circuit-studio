import { assertObject, assertVector3 } from "@/_old_/tool/validator"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import ServiceLocatorInterface from "@/_old_/contract/service/locator"

export function makeSetBackgroundColor(locator: ServiceLocatorInterface) {
    return async (params: unknown) => {
        assertObject(params, "setBackgroundColor")
        const { color } = params
        assertVector3(color, "setBackgroundColor.color")
        const scene = locator.get("scene", ensureSceneManagerInterface)
        await scene.backgroundColorSet(color)
        await scene.imageStream.askForNextFrame()
    }
}
