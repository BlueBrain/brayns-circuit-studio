import { ModalManagerInterface } from "@/_old_/contract/manager/modal"
import { VolumeListInterface } from "@/_old_/contract/manager/models/types/volume-list"
import { VolumeModel } from "@/_old_/contract/manager/models/types/volume-model"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { ColorrampDefinition } from "@/_old_/contract/manager/scene/scene-colorramp"
import { useServiceLocator } from "@/_old_/tool/locator"
import { useModal } from "@/_old_/ui/modal"
import Button from "@/_old_/ui/view/button"
import Flex from "@/_old_/ui/view/flex"
import Icon from "@/_old_/ui/view/icon"
import Details from "@/_old_/view/details"
import * as React from "react"
import "./volume-button-view.css"
import ColorChip from "@/_old_/ui/view/color-chip"
import { extractSolidColor } from "@/_old_/contract/manager/models/types/model-types"
import { useColorEditor } from "./use-color-editor"

export interface VolumeButtonViewProps {
    className?: string
    volume: VolumeModel
}

const USE_CASES = {
    Density: null,
    "Flatmap areas": <p>Display the volume flatmap areas.</p>,
    "Highlight columns": (
        <p>
            Columns are always aligned on the Y axis so their position uses only
            XZ.
        </p>
    ),
    "Layer distance": (
        <p>Display the volume as the distance of a layer from its neighbors.</p>
    ),
    "Orientation field": (
        <p>Display the volume data as an orientation field.</p>
    ),
    "Outline mesh shell": <p>Display the volume using its shell outline.</p>,
}

export default function VolumeButtonView({
    className,
    volume,
}: VolumeButtonViewProps) {
    const editColors = useColorEditor()
    const { scene } = useServiceLocator({
        scene: ensureSceneManagerInterface,
    })
    const [, setColorramp] = React.useState<ColorrampDefinition | null>(null)
    const refresh = React.useCallback(() => {
        const [modelId] = volume.modelIds
        scene.colorramp.get(modelId).then(setColorramp).catch(console.error)
        void scene.imageStream.askForNextFrame()
    }, [scene, volume])
    const volumeList = scene.models.volume
    const modal = useModal()
    const handleVisibleClick = React.useCallback(() => {
        void volumeList
            .updateVisible(volume.id, !volume.visible)
            .then(refresh)
            .catch(console.error)
    }, [volume, volumeList])
    const handleFocusClick = React.useCallback(() => {
        void scene.focusOnModel(volume.modelIds)
    }, [volume, scene])
    const handleVolumeDeleteClick = useVolumeDeleteClickHandler(
        modal,
        volume,
        volumeList,
        refresh
    )
    const handleUseCaseChange = useUseCaseChangeHandler(
        modal,
        volumeList,
        volume,
        refresh
    )
    return (
        <div className={getClassNames(className)}>
            <Details label={`#${volume.id} - ${volume.name}`} className="wide">
                <Flex
                    direction="column"
                    gap=".5em"
                    padding="0.5em 0"
                    justifyContent="space-around"
                    alignItems="stretch"
                >
                    <Flex gap="0">
                        <Icon
                            name={volume.visible ? "show" : "hide"}
                            onClick={handleVisibleClick}
                        />
                        <Button
                            icon="focus"
                            label="Focus"
                            onClick={handleFocusClick}
                        />
                        <Button
                            icon={
                                <ColorChip
                                    color={extractSolidColor(volume.colors)}
                                />
                            }
                            label="Color"
                            onClick={() => {
                                const action = async () => {
                                    await editColors(volume)
                                    await scene.imageStream.askForNextFrame()
                                }
                                void action()
                            }}
                        />
                        <Button
                            icon="delete"
                            label="Delete"
                            accent={true}
                            onClick={handleVolumeDeleteClick}
                        />
                    </Flex>
                    <fieldset>
                        <legend>{volume.useCase}</legend>
                        <div>
                            Current use case is <b>{volume.useCase}</b>.
                        </div>
                        {USE_CASES[volume.useCase]}
                    </fieldset>
                    {volume.availableUseCases.length > 0 && (
                        <>
                            <div>You can switch to:</div>
                            <ul className="usecases">
                                {volume.availableUseCases
                                    .filter(isAcceptedUseCase(volume.useCase))
                                    .map((usecase) => (
                                        <li key={usecase}>
                                            <Button
                                                label={usecase}
                                                flat
                                                onClick={() =>
                                                    handleUseCaseChange(usecase)
                                                }
                                            />
                                            {USE_CASES[usecase]}
                                        </li>
                                    ))}
                            </ul>
                        </>
                    )}
                    {/* <TransferFunctionEditor modelId={volume.modelIds[0] ?? 0} /> */}
                </Flex>
            </Details>
        </div>
    )
}

function useUseCaseChangeHandler(
    modal: ModalManagerInterface,
    volumeList: VolumeListInterface,
    volume: VolumeModel,
    refresh: () => void
) {
    return React.useCallback(
        (useCase: string) => {
            modal
                .wait(
                    `Switching to "${useCase}"...`,
                    volumeList.updateUseCase(volume.id, useCase)
                )
                .then(refresh)
                .catch(console.error)
        },
        [volume, volumeList]
    )
}

function useVolumeDeleteClickHandler(
    modal: ModalManagerInterface,
    volume: VolumeModel,
    volumeList: VolumeListInterface,
    refresh: () => void
) {
    return React.useCallback(() => {
        void modal
            .confirm({
                content: (
                    <div>
                        You are about to delete the volume{" "}
                        <b>
                            #{volume.id} - {volume.name}
                        </b>
                        .
                    </div>
                ),
                title: "Delete",
                accent: true,
            })
            .then((confirm) => {
                if (confirm) {
                    volumeList
                        .remove(volume.id)
                        .then(refresh)
                        .catch(console.error)
                }
            })
    }, [volume, volumeList])
}

function getClassNames(className: string | undefined): string {
    const classNames = [
        "custom",
        "view-page-models-VolumeButtonView",
        "theme-color-section",
    ]
    if (typeof className === "string") {
        classNames.push(className)
    }

    return classNames.join(" ")
}

/**
 * For now, we only accept use cases we know to need no parameter.
 */
const ACCEPTED_USE_CASES = Object.keys(USE_CASES)

function isAcceptedUseCase(exclude: string) {
    return (name: string) =>
        ACCEPTED_USE_CASES.includes(name) && name !== exclude
}
