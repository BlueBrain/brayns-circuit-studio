import * as React from "react"
import Color from "@/_old_/ui/color"
import ColorPicker from "@/_old_/ui/view/color-picker"
import Dialog from "@/_old_/ui/view/dialog"
import ServiceLocatorInterface from "@/_old_/contract/service/locator"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"

export function applyCellColor(
    modal: ModalManagerInterface,
    locator: ServiceLocatorInterface,
    modelId: number,
    cellId: number
) {
    const color = Color.fromHSL(Math.random(), 1, 0.5)
    color.rgb2hsl()
    const hide = modal.show({
        align: "TR",
        content: (
            <Dialog
                title={`Apply color to cell #${cellId}`}
                onOK={() => {
                    hide()
                }}
                onCancel={() => hide()}
            >
                <ColorPicker
                    hue={color.H}
                    sat={color.S}
                    lum={color.L}
                    onChange={(hue, sat, lum) => {
                        color.H = hue
                        color.S = sat
                        color.L = lum
                        color.hsl2rgb()
                    }}
                />
            </Dialog>
        ),
    })
}

// function applyColorByCellId(
//     locator: ServiceLocatorInterface,
//     modelId: number,
//     cellId: number
// ): Promise<void> {
//     const scene = locator.get("scene", ensureSceneManagerInterface)
//     const circuit = findCircuitByModelId(scene.getCircuits(), modelId)
//     if (!circuit) return

//     circuit.
// }

// function findCircuitByModelId(
//     circuits: ModelDescription<CircuitData>[],
//     modelId: number
// ) {
//     for (const circuit of circuits) {
//         for (const model of circuit.braynsModels) {
//             if (model.id === modelId) return circuit
//         }
//     }
//     return undefined
// }
