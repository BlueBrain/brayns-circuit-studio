import { CellPlacementModel } from "@/_old_/contract/manager/models"
import { useModal } from "@/_old_/ui/modal"
import Button from "@/_old_/ui/view/button/button-view"
import Expand from "@/_old_/ui/view/expand"
import Style from "./cell-placement-button-view.module.css"

export interface CellPlacementButtonViewProps {
    className?: string
    cellPlacement: CellPlacementModel
    onFocus(this: void, modelIds: number[]): void
    onRename(this: void, cellPlacement: CellPlacementModel): void
    onShow(this: void, cellPlacement: CellPlacementModel): void
    onHide(this: void, cellPlacement: CellPlacementModel): void
    onDelete(this: void, cellPlacement: CellPlacementModel): void
}

export default function CellPlacementButtonView(
    props: CellPlacementButtonViewProps
) {
    const modal = useModal()
    const { cellPlacement } = props
    const { modelIds } = cellPlacement
    const handleToggle = () => {
        if (cellPlacement.visible) props.onHide(cellPlacement)
        else props.onShow(cellPlacement)
    }
    const handleDelete = async () => {
        const confirm = await modal.confirm({
            content: (
                <div>
                    <p>
                        Ae you sure you want to delete{" "}
                        <b>{cellPlacement.name}</b>?
                    </p>
                    <small>
                        <code>{cellPlacement.path}</code>
                    </small>
                </div>
            ),
        })
        if (!confirm) return

        props.onDelete(cellPlacement)
    }
    return (
        <Expand
            className={getClassNames(props)}
            label={`${cellPlacement.name} (#${cellPlacement.id})`}
        >
            <div className={Style.grid}>
                <Button
                    icon="focus"
                    flat={true}
                    label="Focus"
                    onClick={() => props.onFocus(modelIds)}
                />
                <Button
                    icon="edit"
                    flat={true}
                    label="Rename"
                    onClick={() => props.onRename(cellPlacement)}
                />
                <Button
                    icon={cellPlacement.visible ? "show" : "hide"}
                    flat={true}
                    label={cellPlacement.visible ? "Hide" : "Show"}
                    onClick={handleToggle}
                />
                <Button
                    icon="delete"
                    label="Delete"
                    accent={true}
                    onClick={() => void handleDelete()}
                />
            </div>
            <div className={Style.path}>{cellPlacement.path}</div>
        </Expand>
    )
}

function getClassNames(props: CellPlacementButtonViewProps): string {
    const classNames = [
        "custom",
        "view-page-models-CellPlacementButtonView",
        "theme-color-section",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
