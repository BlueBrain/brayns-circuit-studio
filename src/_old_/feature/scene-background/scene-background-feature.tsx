import SceneBackgroundFeatureInterface from "@/_old_/contract/feature/scene-background"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import Color from "@/_old_/ui/color"
import ColorPicker from "@/_old_/ui/view/color-picker"
import Dialog from "@/_old_/ui/view/dialog"
import React from "react"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"

export default class SceneBackgroundFeature
    implements SceneBackgroundFeatureInterface
{
    constructor(private readonly brayns: BraynsApiServiceInterface) {}

    async changeBackgroundColor(modal: ModalManagerInterface): Promise<void> {
        const currentColor = await modal.wait(
            "Reading current color...",
            this.brayns.getSceneBackgroundColor()
        )
        const [hue, sat, lum] = getHSL(...currentColor)
        const hide = modal.show({
            background: "transparent",
            align: "TL",
            onClose: () => {
                void this.brayns.setSceneBackgroundColor(currentColor)
            },
            content: (
                <Dialog
                    title="Select scene background color"
                    onCancel={() => {
                        hide()
                        void this.brayns.setSceneBackgroundColor(currentColor)
                    }}
                    onOK={() => hide()}
                >
                    <ColorPicker
                        hue={hue}
                        sat={sat}
                        lum={lum}
                        onChange={(H, S, L) => {
                            const color = Color.fromHSL(H, S, L)
                            void this.brayns.setSceneBackgroundColor(
                                color.toArrayRGB()
                            )
                        }}
                    />
                </Dialog>
            ),
        })
    }
}

function getHSL(
    red: number,
    green: number,
    blue: number,
    alpha: number
): [number, number, number] {
    const color = Color.fromArrayRGBA([red, green, blue, alpha])
    color.rgb2hsl()
    return [color.H, color.S, color.L]
}
