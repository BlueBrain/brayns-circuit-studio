import { CircuitColorManagerInterface } from "@/_old_/contract/manager/colors"
import Button from "@/_old_/ui/view/button"
import * as React from "react"
import { useModal } from "../../../ui/modal"
import { getEnabledColors } from "../color-converter"
import { useOptionalColors } from "../hooks"
import OptionalColorsEditor from "../optional-colors-editor"
import "./color-by-mtype-view.css"

export interface ColorByMTypeViewProps {
    className?: string
    manager: CircuitColorManagerInterface
}

export default function ColorByMTypeView(props: ColorByMTypeViewProps) {
    const modal = useModal()
    const names = props.manager.colorableMorphologyTypes
    const [colors, setColors] = useOptionalColors("mtype", names)
    return (
        <div className={getClassNames(props)}>
            <OptionalColorsEditor
                names={names}
                value={colors}
                onChange={setColors}
            />
            <Button
                label="Apply Color by Morphology Type"
                accent={true}
                wide={true}
                onClick={() => {
                    void modal.wait(
                        "Apply Colors...",
                        props.manager.applyColorByMorphologyTypes(
                            getEnabledColors(colors, names)
                        )
                    )
                }}
            />
        </div>
    )
}

function getClassNames(props: ColorByMTypeViewProps): string {
    const classNames = ["custom", "view-circuitColorEditor-ColorByMTypeView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
