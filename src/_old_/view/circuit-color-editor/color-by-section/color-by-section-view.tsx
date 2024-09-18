import * as React from "react"
import Button from "@/_old_/ui/view/button"
import OptionalColorsEditor from "../optional-colors-editor"
import { CircuitColorManagerInterface } from "@/_old_/contract/manager/colors"
import { getEnabledColors } from "../color-converter"
import { useOptionalColors } from "../hooks"
import "./color-by-section-view.css"
import { useModal } from "@/_old_/ui/modal"

export interface ColorBySectionViewProps {
    className?: string
    manager: CircuitColorManagerInterface
}

export default function ColorBySectionView(props: ColorBySectionViewProps) {
    const modal = useModal()
    const names = props.manager.colorableMorphologySections
    const [colors, setColors] = useOptionalColors("section", names)
    return (
        <div className={getClassNames(props)}>
            <OptionalColorsEditor
                names={names}
                value={colors}
                onChange={setColors}
            />
            <Button
                label="Apply Color by Section"
                accent={true}
                wide={true}
                onClick={() => {
                    void modal.wait(
                        "Apply Colors...",
                        props.manager.applyColorByMorphologySections(
                            getEnabledColors(colors, names)
                        )
                    )
                }}
            />
        </div>
    )
}

function getClassNames(props: ColorBySectionViewProps): string {
    const classNames = ["custom", "view-circuitColorEditor-ColorBySectionView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
