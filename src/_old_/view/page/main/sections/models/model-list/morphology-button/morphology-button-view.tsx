import * as React from "react"
import Button from "@/_old_/ui/view/button"
import ColorChip from "@/_old_/ui/view/color-chip"
import Details from "@/_old_/view/details"
import Flex from "@/_old_/ui/view/flex"
import Icon from "@/_old_/ui/view/icon"
import { MorphologyModel } from "@/_old_/contract/manager/models/types/morphology-model"
import "./morphology-button-view.css"
import { extractSolidColor } from "@/_old_/contract/manager/models/types/model-types"

export interface CircuitButtonViewProps {
    className?: string
    morphology: MorphologyModel
    onDelete(this: void, morphology: MorphologyModel): void
    onFocus(this: void, morphology: MorphologyModel): void
    onColorClick(this: void, morphology: MorphologyModel): void
    onVisibleClick(this: void, morphology: MorphologyModel): void
    onNameChange(this: void, name: string): void
}

export default function CircuitButtonView(props: CircuitButtonViewProps) {
    const { morphology } = props
    return (
        <div className={getClassNames(props)}>
            <Details
                label={`#${morphology.id} - ${morphology.name}`}
                className="wide"
            >
                <Flex gap="0">
                    <Icon
                        name={morphology.visible ? "show" : "hide"}
                        onClick={() => props.onVisibleClick(morphology)}
                    />
                    <Button
                        icon="focus"
                        label="Focus"
                        onClick={() => props.onFocus(morphology)}
                    />
                    <Button
                        icon={
                            <ColorChip
                                color={extractSolidColor(morphology.colors)}
                            />
                        }
                        label="Color"
                        onClick={() => props.onColorClick(morphology)}
                    />
                    <Button
                        icon="delete"
                        label="Delete"
                        accent={true}
                        onClick={() => props.onDelete(morphology)}
                    />
                </Flex>
            </Details>
        </div>
    )
}

function getClassNames(props: CircuitButtonViewProps): string {
    const classNames = [
        "custom",
        "view-page-models-MorphologyButtonView",
        "theme-color-section",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
