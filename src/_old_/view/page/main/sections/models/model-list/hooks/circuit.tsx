import * as React from "react"
import FullColorPicker from "@/_old_/view/full-color-picker"
import { useModal } from "@/_old_/ui/modal"
import { CircuitListInterface } from "@/_old_/contract/manager/models/types/circuit-list"
import { CircuitModel } from "@/_old_/contract/manager/models/types/circuit-model"
import { Vector4 } from "@/_old_/contract/tool/calc"
import { extractSolidColor } from "@/_old_/contract/manager/models/types/model-types"

export function useCircuitHandlers(
    circuitList: CircuitListInterface,
    refresh: () => void
) {
    const modal = useModal()
    const handleCircuitVisibleClick = React.useCallback(
        (circuit: CircuitModel) => {
            circuitList
                .updateVisible(circuit.id, !circuit.visible)
                .then(refresh)
                .catch(console.error)
        },
        [circuitList]
    )
    const handleCircuitColorClick = React.useCallback(
        (circuit: CircuitModel) => {
            const hide = modal.show({
                content: (
                    <FullColorPicker
                        value={extractSolidColor(circuit.colors)}
                        onValidate={(value: Vector4) => {
                            hide()
                            circuitList
                                .updateColor(circuit.id, {
                                    method: "solid",
                                    values: { color: value },
                                })
                                .then(refresh)
                                .catch(console.error)
                        }}
                        onCancel={() => hide()}
                    />
                ),
            })
        },
        [circuitList, modal]
    )
    const handleCircuitDeleteClick = React.useCallback(
        (circuit: CircuitModel) => {
            void modal
                .confirm({
                    content: (
                        <div>
                            You are about to delete the circuit{" "}
                            <b>
                                #{circuit.id} - {circuit.name}
                            </b>
                            .
                        </div>
                    ),
                    title: "Delete",
                    accent: true,
                })
                .then((confirm) => {
                    if (confirm) {
                        circuitList
                            .remove(circuit.id)
                            .then(refresh)
                            .catch(console.error)
                    }
                })
        },
        [circuitList]
    )
    return {
        handleCircuitColorClick,
        handleCircuitDeleteClick,
        handleCircuitVisibleClick,
    }
}
