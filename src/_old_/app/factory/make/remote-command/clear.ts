import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import ServiceLocatorInterface from "@/_old_/contract/service/locator"

export function makeClear(locator: ServiceLocatorInterface) {
    return async () => {
        const scene = locator.get("scene", ensureSceneManagerInterface)
        await scene.reset()
    }
}
