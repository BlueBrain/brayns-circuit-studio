import * as React from "react"
import Button from "@/_old_/ui/view/button"
import ColorChip from "@/_old_/ui/view/color-chip"
import Details from "@/_old_/view/details"
import Flex from "@/_old_/ui/view/flex"
import Icon from "@/_old_/ui/view/icon"
import { MeshModel } from "@/_old_/contract/manager/models/types/mesh-model"
import "./mesh-button-view.css"
import { useServiceLocator } from "@/_old_/tool/locator"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { useModal } from "@/_old_/ui/modal"
import { Vector4 } from "@/_old_/contract/tool/calc"
import { useAskColor } from "@/_old_/user-input/color"
import { extractSolidColor } from "@/_old_/contract/manager/models/types/model-types"

export interface MeshButtonViewProps {
    className?: string
    mesh: MeshModel
}

export default function MeshButtonView({
    className,
    mesh,
}: MeshButtonViewProps) {
    const askColor = useAskColor()
    const { scene } = useServiceLocator({
        scene: ensureSceneManagerInterface,
    })
    const refresh = React.useCallback(
        () => void scene.imageStream.askForNextFrame(),
        [scene]
    )
    const meshList = scene.models.mesh
    const modal = useModal()
    const handleVisibleClick = React.useCallback(() => {
        void meshList
            .updateVisible(mesh.id, !mesh.visible)
            .then(refresh)
            .catch(console.error)
    }, [mesh, meshList])
    const handleFocusClick = React.useCallback(() => {
        void scene.focusOnModel(mesh.modelIds)
    }, [mesh, scene])
    const handleMeshColorClick = React.useCallback(() => {
        askColor({
            currentColor: extractSolidColor(mesh.colors),
            showOpacity: true,
        })
            .then((value: Vector4) =>
                meshList
                    .updateColor(mesh.id, {
                        method: "solid",
                        values: { color: value },
                    })
                    .then(refresh)
                    .catch(console.error)
            )
            .catch(console.error)
    }, [mesh, meshList])
    const handleMeshDeleteClick = React.useCallback(() => {
        void modal
            .confirm({
                content: (
                    <div>
                        You are about to delete the mesh{" "}
                        <b>
                            #{mesh.id} - {mesh.name}
                        </b>
                        .
                    </div>
                ),
                title: "Delete",
                accent: true,
            })
            .then((confirm) => {
                if (confirm) {
                    meshList.remove(mesh.id).then(refresh).catch(console.error)
                }
            })
    }, [mesh, meshList])
    return (
        <div className={getClassNames(className)}>
            <Details label={`#${mesh.id} - ${mesh.name}`} className="wide">
                <Flex gap="0">
                    <Icon
                        name={mesh.visible ? "show" : "hide"}
                        onClick={handleVisibleClick}
                    />
                    <Button
                        icon="focus"
                        label="Focus"
                        onClick={handleFocusClick}
                    />
                    <Button
                        icon={
                            <ColorChip color={extractSolidColor(mesh.colors)} />
                        }
                        label="Color"
                        onClick={handleMeshColorClick}
                    />
                    <Button
                        icon="delete"
                        label="Delete"
                        accent={true}
                        onClick={handleMeshDeleteClick}
                    />
                </Flex>
            </Details>
        </div>
    )
}

function getClassNames(className: string | undefined): string {
    const classNames = [
        "custom",
        "view-page-models-MeshButtonView",
        "theme-color-section",
    ]
    if (typeof className === "string") {
        classNames.push(className)
    }

    return classNames.join(" ")
}
