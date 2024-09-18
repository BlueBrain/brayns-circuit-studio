import * as React from "react"
import FullColorPicker from "@/_old_/view/full-color-picker"
import { useModal } from "@/_old_/ui/modal"
import { MorphologyListInterface } from "@/_old_/contract/manager/models/types/morphology-list"
import { MorphologyModel } from "@/_old_/contract/manager/models/types/morphology-model"
import { Vector4 } from "@/_old_/contract/tool/calc"
import { extractSolidColor } from "@/_old_/contract/manager/models/types/model-types"

export function useMorphologyHandlers(
    morphologyList: MorphologyListInterface,
    refresh: () => void
) {
    const modal = useModal()
    const handleMorphologyVisibleClick = React.useCallback(
        (morphology: MorphologyModel) => {
            morphologyList
                .updateVisible(morphology.id, !morphology.visible)
                .then(refresh)
                .catch(console.error)
        },
        [morphologyList]
    )
    const handleMorphologyColorClick = React.useCallback(
        (morphology: MorphologyModel) => {
            const hide = modal.show({
                content: (
                    <FullColorPicker
                        value={extractSolidColor(morphology.colors)}
                        onValidate={(value: Vector4) => {
                            hide()
                            morphologyList
                                .updateColor(morphology.id, {
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
        [morphologyList]
    )
    const handleMorphologyDeleteClick = React.useCallback(
        (morphology: MorphologyModel) => {
            void modal
                .confirm({
                    content: (
                        <div>
                            You are about to delete the morphology{" "}
                            <b>
                                #{morphology.id} - {morphology.name}
                            </b>
                            .
                        </div>
                    ),
                    title: "Delete",
                    accent: true,
                })
                .then((confirm) => {
                    if (confirm) {
                        morphologyList
                            .remove(morphology.id)
                            .then(refresh)
                            .catch(console.error)
                    }
                })
        },
        [morphologyList]
    )
    return {
        handleMorphologyColorClick,
        handleMorphologyDeleteClick,
        handleMorphologyVisibleClick,
    }
}
