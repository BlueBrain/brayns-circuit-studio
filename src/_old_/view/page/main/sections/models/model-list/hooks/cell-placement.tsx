import { CellPlacementListInterface } from "@/_old_/contract/manager/models/types/cell-placement-list"
import { useModal } from "@/_old_/ui/modal"
import { CellPlacementModel } from "@/_old_/contract/manager/models"
import InputText from "@/_old_/ui/view/input/text"

export function useCellPlacementHandlers(
    cellPlacementList: CellPlacementListInterface,
    refresh: () => void
): {
    handleCellPlacementVisible(
        this: void,
        cellPlacement: CellPlacementModel,
        visible: boolean
    ): void
    handleCellPlacementRename(
        this: void,
        cellPlacement: CellPlacementModel
    ): void
    handleCellPlacementDelete(
        this: void,
        cellPlacement: CellPlacementModel
    ): void
} {
    const modal = useModal()
    return {
        handleCellPlacementVisible(
            cellPlacement: CellPlacementModel,
            visible: boolean
        ) {
            cellPlacementList
                .updateVisible(cellPlacement.id, visible)
                .then(refresh)
                .catch(console.error)
        },
        handleCellPlacementDelete(cellPlacement: CellPlacementModel) {
            cellPlacementList
                .remove(cellPlacement.id)
                .then(refresh)
                .catch(console.error)
        },
        handleCellPlacementRename(cellPlacement: CellPlacementModel) {
            modal
                .input({
                    content: InputText,
                    props: {
                        value: cellPlacement.name,
                        title: "Rename cell placement",
                    },
                })
                .then((name) => {
                    void cellPlacementList.updateName(
                        cellPlacement.id,
                        name as string
                    )
                })
                .catch(console.error)
        },
    }
}
