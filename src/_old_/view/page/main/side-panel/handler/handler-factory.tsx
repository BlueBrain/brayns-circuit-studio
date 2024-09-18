import SceneManagerInterface from "@/_old_/contract/manager/scene"
import React from "react"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"

export function makeFocusHandler(
    scene: SceneManagerInterface,
    refresh: () => void
): (modelIds: number[]) => void {
    const handler = (modelIds: number[]) =>
        void scene.focusOnModel(modelIds).then(refresh).catch(console.error)
    return handler
}

export function makeResetClickHandler(
    modal: ModalManagerInterface,
    scene: SceneManagerInterface
): () => void {
    const handler = async () => {
        if (
            await modal.confirm({
                accent: true,
                content: (
                    <>
                        <p>
                            <b>You are about to reset your data.</b>
                        </p>
                        <p>
                            <br />
                            This action will restart your session from scratch
                            and
                            <br />
                            you will loose your current work.
                        </p>
                    </>
                ),
                title: "Reset Everything",
            })
        ) {
            await modal.wait("Resetting everything...", scene.reset())
        }
    }
    return () => void handler()
}
