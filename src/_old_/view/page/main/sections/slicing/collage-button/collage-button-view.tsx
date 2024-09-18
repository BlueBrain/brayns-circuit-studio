import { Collage } from "@/_old_/contract/feature/morphology-collage"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"
import { useModal } from "@/_old_/ui/modal"
import Button from "@/_old_/ui/view/button"
import Flex from "@/_old_/ui/view/flex"
import Icon from "@/_old_/ui/view/icon"
import InputText from "@/_old_/ui/view/input/text"
import * as React from "react"
import "./collage-button-view.css"

export interface CollageButtonViewProps {
    className?: string
    value: Collage
    onCollageUpdate(value: Collage): void
    onCollageDelete(value: Collage): void
    onEditClick(value: Collage): void
    onViewClick(value: Collage): void
}

export default function BezierSlicesButtonView(props: CollageButtonViewProps) {
    const modal = useModal()
    const collage = props.value
    const [expanded, setExpanded] = React.useState(false)
    const [newName, setNewName] = React.useState(collage.name)
    const handleRename = makeRenameHandler(props, newName)
    const toggle = () => setExpanded(!expanded)
    const handleDelete = makeDeleteHandler(modal, props)
    return (
        <div className={getClassNames(props, expanded)}>
            <header className="theme-color-primary-dark">
                <Icon
                    className="chevron"
                    name="chevron-right"
                    onClick={toggle}
                />
                <div
                    className="name"
                    onClick={toggle}
                    title={`${collage.name} (#${collage.id})`}
                >
                    {collage.name}
                </div>
                <Icon
                    className="clickable"
                    name="edit"
                    onClick={() => props.onEditClick(collage)}
                />
                <Icon
                    className="clickable"
                    name="show"
                    onClick={() => props.onViewClick(collage)}
                />
            </header>
            {expanded && (
                <div>
                    <Flex justifyContent="space-between">
                        <InputText
                            className="flex-1"
                            value={newName}
                            onChange={setNewName}
                            onEnterPressed={handleRename}
                        />
                        <Button
                            className="flex-0"
                            accent={true}
                            enabled={newName !== props.value.name}
                            label="Rename"
                            onClick={handleRename}
                        />
                    </Flex>
                    <Flex justifyContent="space-between" alignItems="center">
                        <div>
                            <b>{collage.slices.width.toFixed()}</b> µm &times;{" "}
                            <b>{collage.slices.height.toFixed()}</b> µm &times;{" "}
                            <b>{collage.slices.depth.toFixed()}</b> µm
                        </div>
                        <div>
                            Count: <b>{collage.slices.positions.length}</b>
                        </div>
                    </Flex>
                    <Button
                        icon="delete"
                        label="Delete this Slices Set"
                        accent={true}
                        onClick={() => void handleDelete()}
                    />
                </div>
            )}
        </div>
    )
}

function makeRenameHandler(props: CollageButtonViewProps, newName: string) {
    return () => {
        props.onCollageUpdate({
            ...props.value,
            name: newName,
        })
    }
}

function makeDeleteHandler(
    modal: ModalManagerInterface,
    props: CollageButtonViewProps
) {
    return async () => {
        const confirm = await modal.confirm({
            title: "Delete Slices",
            content: (
                <div>
                    You are about to delete slices set #{props.value.id}:<br />
                    <b>{props.value.name}</b>
                </div>
            ),
        })
        if (confirm) props.onCollageDelete(props.value)
    }
}

function getClassNames(
    props: CollageButtonViewProps,
    expanded: boolean
): string {
    const classNames = [
        "custom",
        "view-page-main-sections-slicing-CollageButtonView",
        "theme-color-section",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (expanded) classNames.push("expanded")

    return classNames.join(" ")
}
