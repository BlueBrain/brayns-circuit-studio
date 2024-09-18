import * as React from "react"
import Button from "@/_old_/ui/view/button"
import { useModal } from "@/_old_/ui/modal"
import SceneManagerInterface from "@/_old_/contract/manager/scene"

export default function ClippingPlanesRemovalButton({
    planesCount,
    scene,
}: {
    planesCount: number
    scene: SceneManagerInterface
}) {
    const modal = useModal()
    if (planesCount === 0) return null

    return (
        <Button
            icon="cut-off"
            wide={true}
            accent={true}
            label={`Remove ${planesCount} active clipping planes`}
            onClick={() =>
                void modal.wait(
                    "Removing clipping planes...",
                    scene.clippingPlanes.clear()
                )
            }
        />
    )
}
