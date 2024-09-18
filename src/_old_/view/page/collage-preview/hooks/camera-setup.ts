import SceneManagerInterface from "@/_old_/contract/manager/scene"
import { Slices } from "@/_old_/contract/feature/morphology-collage"
import { useDebouncedEffect } from "@/_old_/ui/hooks/debounced-effect"

export function useCameraSetup(
    sliceIndex: number,
    slices: Slices,
    scene: SceneManagerInterface
) {
    useDebouncedEffect(
        () => {
            const action = async () => {
                const slice = slices.positions[sliceIndex]
                if (!slice) return

                await scene.clippingPlanes.clear()
                // await scene.clippingPlanes.add(center, direction)
                scene.camera.setHeightAtTarget(slices.height)
                scene.camera.updateParams({
                    orientation: slice.orientation,
                    target: slice.center,
                    distance: slices.depth * 2,
                })
            }
            void action()
        },
        [sliceIndex],
        100
    )
}
